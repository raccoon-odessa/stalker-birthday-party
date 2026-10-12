// Kingdom Come style dice: scoring plus a small game engine that works on plain objects,
// so the same state can live in memory (same phone, practice) or in Firestore (live games).
export const TARGET = 2000;

const val3 = (f, n) => (f === 1 ? 1000 : f * 100) * Math.pow(2, n - 3);
function best(c){
  let total = 0; for (let f = 1; f <= 6; f++) total += c[f];
  if (!total) return 0;
  let r = -Infinity;
  const minus = fs => { const d = c.slice(); fs.forEach(f => d[f]--); return d; };
  if (c[1] && c[2] && c[3] && c[4] && c[5] && c[6]) r = Math.max(r, 1500 + best(minus([1,2,3,4,5,6])));
  if (c[1] && c[2] && c[3] && c[4] && c[5]) r = Math.max(r, 500 + best(minus([1,2,3,4,5])));
  if (c[2] && c[3] && c[4] && c[5] && c[6]) r = Math.max(r, 750 + best(minus([2,3,4,5,6])));
  let s = 0;
  for (let f = 1; f <= 6; f++){ const n = c[f]; if (!n) continue; if (n >= 3) s += val3(f, n); else if (f === 1) s += 100 * n; else if (f === 5) s += 50 * n; else { s = -Infinity; break; } }
  return Math.max(r, s);
}
const counts = vals => { const c = [0,0,0,0,0,0,0]; vals.forEach(v => c[v]++); return c; };
export const scoreOf = vals => vals.length ? best(counts(vals)) : 0;
export const canScore = vals => { const c = counts(vals); return c[1] > 0 || c[5] > 0 || c.some(n => n >= 3) || (c[2] > 0 && c[3] > 0 && c[4] > 0 && c[5] > 0 && c[6] > 0); };

const d6 = () => 1 + Math.floor(Math.random() * 6);
const say = (s, text) => { s.log.unshift(text); s.log = s.log.slice(0, 30); };
export const live = s => s.dice.filter(d => !d.used);
export const selected = s => s.phase === 'choose' ? live(s).filter(d => d.sel) : [];
export const selScore = s => scoreOf(selected(s).map(d => d.v));

export function fresh(names){
  return {names, scores:[0,0], turn:0, turnPts:0, phase:'start', rollN:0, note:'', winner:null,
    dice:[1,2,3,4,5,6].map(v => ({v, used:false, sel:false})), log:[]};
}
function nextTurn(s){ s.turn = 1 - s.turn; s.turnPts = 0; s.phase = 'start'; s.dice.forEach(d => { d.used = false; d.sel = false; }); }

export function roll(s){
  const ds = live(s); ds.forEach(d => { d.v = d6(); d.sel = false; });
  s.rollN++; s.note = '';
  const who = s.names[s.turn], vals = ds.map(d => d.v);
  say(s, who + ' throws ' + vals.join(' '));
  if (!canScore(vals)){
    s.note = who + ' threw nothing that scores' + (s.turnPts ? ' and lost ' + s.turnPts.toLocaleString('en-US') : '') + '.';
    say(s, who + ' busts.');
    nextTurn(s);
    return false;
  }
  s.phase = 'choose';
  return true;
}
export function toggle(s, i){ const d = s.dice[i]; if (s.phase !== 'choose' || !d || d.used) return; d.sel = !d.sel; }
function keep(s){
  const sel = selected(s), sc = scoreOf(sel.map(d => d.v));
  if (!(sc > 0)) return false;
  sel.forEach(d => { d.used = true; d.sel = false; });
  s.turnPts += sc;
  say(s, s.names[s.turn] + ' keeps ' + sel.map(d => d.v).join(' ') + ' for ' + sc + '.');
  if (!live(s).length){ s.dice.forEach(d => d.used = false); say(s, 'All six used. Hot dice!'); }
  return true;
}
export function throwOn(s){
  if (s.phase === 'over') return;
  if (s.phase === 'choose' && !keep(s)) return;
  roll(s);
}
export function bank(s){
  if (s.phase !== 'choose' || !keep(s)) return;
  const t = s.turn;
  s.scores[t] += s.turnPts;
  say(s, s.names[t] + ' banks ' + s.turnPts + ', now at ' + s.scores[t] + '.');
  if (s.scores[t] >= TARGET){ s.winner = t; s.phase = 'over'; s.note = ''; return; }
  s.note = s.names[t] + ' banked ' + s.turnPts.toLocaleString('en-US') + '.';
  nextTurn(s);
}
export function forfeit(s, who){ s.winner = 1 - who; s.phase = 'over'; say(s, s.names[who] + ' gives up.'); }

// The PDA's choices for practice games.
export function botPick(s){
  const idx = s.dice.map((d, i) => i).filter(i => !s.dice[i].used);
  let top = null;
  for (let m = 1; m < (1 << idx.length); m++){
    const pick = idx.filter((_, j) => m & (1 << j)), sc = scoreOf(pick.map(i => s.dice[i].v));
    if (sc > 0 && (!top || sc > top.s || (sc === top.s && pick.length < top.pick.length))) top = {s:sc, pick};
  }
  return top;
}
export function botStops(s, pick){
  const left = live(s).length - pick.pick.length, pts = s.turnPts + pick.s;
  if (s.scores[s.turn] + pts >= TARGET) return true;
  return left > 0 && ((left <= 2 && pts >= 300) || (left === 3 && pts >= 500) || pts >= 1000);
}
