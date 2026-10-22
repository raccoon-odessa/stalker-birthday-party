import * as G from './gear.js?v=13';
import * as D from './dice.js?v=13';
import { HOST_HASH } from './config.js?v=13';
import { QUESTIONS } from './quiz.js?v=13';
import { showCocktail, hideCocktail, COCKTAILS } from './cocktails.js?v=13';

const params = new URLSearchParams(location.search);
const MOCK = params.has('mock');
const $ = id => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const fmt = n => (n || 0).toLocaleString('en-US');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ls = {
  get(k){ try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v){ try { localStorage.setItem(k, v); } catch (e) {} }
};
const boot = (title, text) => { $('bootTitle').textContent = title; $('bootText').textContent = text || ''; };
let toastTimer;
function toast(text){ const t = $('toast'); t.textContent = text; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => t.hidden = true, 3200); }
async function sha(s){ const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
const randomToken = () => { const a = new Uint8Array(8); crypto.getRandomValues(a); return [...a].map(x => 'abcdefghjkmnpqrstuvwxyz23456789'[x % 31]).join(''); };

let DB, pid = null, isHost = false;
const S = {players:{}, feed:[], games:[], party:{}, links:{}, ready:false,
  tab:'invite', gear:'helmet', painting:false, tool:'brush', color:19, mirror:false, undo:[], sel:null,
  opp:null, mode:'phone', local:null, lastRoll:{}, dismissed:new Set()};
try { S.dismissed = new Set(JSON.parse(ls.get('zone-dismissed') || '[]')); } catch (e) {}
const me = () => S.players[pid];
const nameOf = p => (p && (p.name || '').trim()) || 'Stalker';
const hostName = () => { const h = S.players.host, n = h && (h.name || '').trim(); return n && n !== 'Host' ? n : 'the host'; };
const radio = text => DB.add('feed', {t:Date.now(), text}).catch(e => console.error(e));

function starter(r){
  return [{id:G.uid(), a:G.ART[Math.floor(r() * G.ART.length)].name}];
}
function newPlayer(name, host){
  const r = G.rng((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
  return {name, host:!!host, look:G.randomLook(r), custom:null, coupons:1000, inv:starter(r), rsvp:'', t:Date.now()};
}
function norm(p){
  p.look = G.fixLook(p.look);
  p.inv = (p.inv || []).filter(i => i && G.ARTBY[i.a]);
  if (!Number.isFinite(p.coupons)) p.coupons = 0;
  if (typeof p.custom !== 'string' || p.custom.length !== G.N * G.N) p.custom = null;
  if (typeof p.paint !== 'string' || p.paint.length !== G.N * G.N) p.paint = null;
  if (!p.paint && p.custom) p.paint = G.paintFromCustom(p.custom, p.look);
  return p;
}

/* ---------- start-up ---------- */
async function main(){
  try { DB = await import(MOCK ? './db-mock.js?v=13' : './db-firebase.js?v=13'); }
  catch (e) { boot('No signal', 'The Zone server could not be reached. Check your connection and reload.'); throw e; }
  let token = params.get('id');
  if (token) ls.set('zone-id', token); else token = ls.get('zone-id');
  try {
    if (token){
      if (crypto.subtle && await sha(token) === HOST_HASH){ isHost = true; pid = 'host'; }
      else { const k = await DB.get('keys/' + token); if (k && k.pid) pid = k.pid; }
    }
    if (isHost && !(await DB.get('players/host'))) await DB.set('players/host', newPlayer('Host', true));
  } catch (e) { console.error(e); boot('No signal', 'The Zone server did not answer. Reload in a moment.'); return; }
  if (!pid){ boot('No signal', token ? 'This link is not on the list. Ask the host for your personal link.' : 'Open the personal link from your invitation to get in.'); return; }

  DB.watchCol('players', {}, rows => {
    S.players = Object.fromEntries(rows.map(r => [r.id, norm(r)]));
    if (!me()){ $('app').hidden = true; $('boot').hidden = false; boot('No signal', 'This stalker is no longer on the list. Ask the host for a new link.'); return; }
    if (!S.ready){ S.ready = true; $('boot').hidden = true; $('app').hidden = false; $('hostTab').hidden = !isHost; go(location.hash === '#dice' ? 'dice' : 'invite'); }
    else render();
  }, () => boot('No signal', 'Lost contact with the Zone server. Reload the page.'));
  DB.watchCol('feed', {orderBy:['t', 'desc'], limit:40}, rows => { S.feed = rows; if (S.ready && S.tab === 'camp') renderCamp(); });
  DB.watchCol('games', {where:['players', 'array-contains', pid]}, rows => { S.games = rows; if (S.ready){ renderBadge(); if (S.tab === 'dice') renderDice(); } });
  DB.watchDoc('config/party', d => { S.party = d || {}; if (S.ready && S.tab === 'invite') renderInvite(); });
  DB.watchDoc('config/emission', d => { S.emi = d || {}; emiTick(); if (S.ready && S.tab === 'host') renderEmiHost(); });
  if (isHost) DB.watchCol('links', {}, rows => { S.links = Object.fromEntries(rows.map(r => [r.id, r.token])); if (S.ready && S.tab === 'host') renderHost(); });
}

function savePlayer(patch){
  Object.assign(me(), patch); render();
  return DB.update('players/' + pid, patch).catch(e => { console.error(e); toast('Could not save. Check your connection.'); });
}

/* ---------- top bar + tabs ---------- */
function renderBar(){
  G.draw($('meIcon'), G.compose(me()), true);
  $('meName').textContent = nameOf(me());
  $('meCoupons').textContent = fmt(me().coupons) + ' coupons';
  renderBadge();
}
function renderBadge(){
  const n = incoming().length + (liveGame() && liveGame().status === 'live' && liveGame().s.turn === (liveGame().a === pid ? 0 : 1) ? 1 : 0);
  $('diceBadge').hidden = !n; $('diceBadge').textContent = n;
}
function go(tab){
  S.tab = tab;
  document.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === tab));
  document.querySelectorAll('main > .tab').forEach(s => s.hidden = s.id !== 'tab-' + tab);
  render(); window.scrollTo(0, 0);
}
document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => go(b.dataset.tab)));
document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));
function render(){
  if (!S.ready || !me()) return;
  renderBar();
  ({invite:renderInvite, stalker:renderStalker, pack:renderPack, dice:renderDice, camp:renderCamp, quiz:renderQuiz, host:renderHost})[S.tab]();
}

/* ---------- invite ---------- */
function renderInvite(){
  $('greet').textContent = nameOf(me()) + ', you’re invited to a birthday in the Zone';
  const fact = (id, v) => { $(id).textContent = v || 'To be announced'; $(id).classList.toggle('todo', !v); };
  fact('factWhen', S.party.when); fact('factWhere', S.party.where);
  $('factNote').hidden = !S.party.note; $('factNote').textContent = S.party.note || '';
  $('inviteLede').textContent = 'Make your stalker, collect artefacts and throw dice by the fire. The bar serves cocktails inspired by artefacts, and artefacts are how you pay for them. Win them in minigames and challenges, or buy them from ' + hostName() + ' for coupons.';
  $('rsvpYes').setAttribute('aria-pressed', me().rsvp === 'yes');
  $('rsvpNo').setAttribute('aria-pressed', me().rsvp === 'no');
}
$('rsvpYes').addEventListener('click', () => { const v = me().rsvp === 'yes' ? '' : 'yes'; savePlayer({rsvp:v}); if (v) radio(nameOf(me()) + ' is coming to the fire.'); });
$('rsvpNo').addEventListener('click', () => { savePlayer({rsvp:me().rsvp === 'no' ? '' : 'no'}); });

/* ---------- stalker ---------- */
const GEAR = [
  {id:'helmet', label:'Helmet', key:'helmet', options:G.HELMETS},
  {id:'suit', label:'Suit', key:'suit', options:G.SUITS, groups:G.SUIT_GROUPS},
  {id:'face', label:'Face', key:'face', options:G.FACES, swatches:true},
  {id:'faction', label:'Faction'}
];
function factionTag(node, f){ node.textContent = f.name; node.style.background = G.PAL[f.c]; node.style.color = f.ink; node.style.borderColor = G.PAL[f.c]; }
const setLook = patch => savePlayer({look:Object.assign({}, me().look, patch)});
function renderStalker(){
  const p = me(), custom = !!p.paint;
  $('maker').classList.toggle('painting', S.painting);
  $('hero').hidden = S.painting; $('paint').hidden = !S.painting;
  $('wardrobe').hidden = S.painting; $('locked').hidden = S.painting || !custom; $('paintbox').hidden = !S.painting;
  $('stageActions').hidden = S.painting;
  $('makerTitle').textContent = S.painting ? 'Paint your stalker' : 'Your stalker';
  if (!custom) $('confirmDiscard').hidden = true;
  G.draw($('hero'), G.compose(p), true);
  $('plateName').textContent = nameOf(p);
  factionTag($('plateTag'), G.FACTIONS[p.look.faction]);
  if (S.painting){ renderPaint(); return; }
  const keep = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.k : null;
  const tab = GEAR.find(t => t.id === S.gear);
  $('subtabs').replaceChildren(...GEAR.map(t => { const b = el('button', 'btn', t.label); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', t.id === S.gear); b.setAttribute('aria-pressed', t.id === S.gear); b.dataset.k = 'g' + t.id; b.addEventListener('click', () => { S.gear = t.id; renderStalker(); }); return b; }));
  $('opts').hidden = !tab.options; $('factions').hidden = tab.id !== 'faction';
  $('swGroup1').hidden = $('swGroup2').hidden = !tab.swatches;
  const optNodes = (tab.options || []).map((o, i) => {
    const b = el('button', 'opt'); b.type = 'button'; b.setAttribute('aria-pressed', p.look[tab.key] === i); b.dataset.k = 'o' + i;
    b.append(G.portrait({look:Object.assign({}, p.look, {[tab.key]:i}), paint:p.paint}), el('span', '', o.label));
    if (o.note) b.append(el('small', '', o.note));
    b.addEventListener('click', () => setLook({[tab.key]:i}));
    return b;
  });
  if (tab.groups) $('opts').replaceChildren(...tab.groups.flatMap(gr => [el('h3', 'opt-group', gr)].concat(optNodes.filter((n, i) => tab.options[i].group === gr))));
  else $('opts').replaceChildren(...optNodes);
  if (tab.id === 'faction'){
    const nodes = G.FACTIONS.map((f, i) => {
      const b = el('button', 'faction'); b.type = 'button'; b.setAttribute('aria-pressed', p.look.faction === i); b.dataset.k = 'f' + i;
      const chip = el('i'); chip.style.background = G.PAL[f.c];
      b.append(chip, el('b', '', f.name), el('span', '', f.line));
      b.addEventListener('click', () => setLook({faction:i}));
      return b;
    });
    $('factions').replaceChildren(...G.FACTION_ERAS.flatMap((era, k) => [el('h3', 'opt-group', era)].concat(nodes.filter((n, i) => (G.FACTIONS[i].era || 0) === k))));
  }
  if (tab.swatches){
    const sw = (list, key, box) => $(box).replaceChildren(...list.map((c, i) => { const b = el('button', 'sw'); b.type = 'button'; b.style.background = G.PAL[c]; b.setAttribute('aria-pressed', p.look[key] === i); b.setAttribute('aria-label', (key === 'skin' ? 'Skin tone ' : 'Hair colour ') + (i + 1)); b.dataset.k = key + i; b.addEventListener('click', () => setLook({[key]:i})); return b; }));
    sw(G.SKINS, 'skin', 'sw1'); sw(G.HAIRS, 'hairC', 'sw2');
  }
  if (keep){ const again = document.querySelector('[data-k="' + keep + '"]'); if (again) again.focus(); }
}
$('btnShuffle').addEventListener('click', () => savePlayer({look:G.randomLook(G.rng(Date.now()))}));
const startPaint = () => { S.painting = true; S.undo = []; render(); };
$('btnPaint').addEventListener('click', startPaint);
$('btnResume').addEventListener('click', startPaint);
$('btnDone').addEventListener('click', () => { S.painting = false; render(); });
$('btnDiscard').addEventListener('click', () => { $('confirmDiscard').hidden = false; });
$('btnDiscardNo').addEventListener('click', () => { $('confirmDiscard').hidden = true; });
$('btnDiscardYes').addEventListener('click', () => savePlayer({paint:null, custom:null}));
function renderPaint(){
  G.draw($('paint'), G.compose(me()), false);
  document.querySelectorAll('[data-tool]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tool === S.tool));
  $('btnMirror').setAttribute('aria-pressed', S.mirror);
  $('btnUndo').disabled = !S.undo.length;
  $('paintPal').replaceChildren(...G.PAL.map((c, i) => { const b = el('button', 'sw'); b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', 'Colour ' + (i + 1)); b.setAttribute('aria-pressed', S.color === i && S.tool !== 'erase'); b.addEventListener('click', () => { S.color = i; S.tool = 'brush'; renderPaint(); }); return b; }));
}
document.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => { S.tool = b.dataset.tool; renderPaint(); }));
$('btnMirror').addEventListener('click', () => { S.mirror = !S.mirror; renderPaint(); });
$('btnUndo').addEventListener('click', () => { if (S.undo.length) savePlayer({paint:S.undo.pop(), custom:null}); });
(() => {
  const cv = $('paint'), N = G.N; let ov = null, last = null;
  const cellAt = e => { const r = cv.getBoundingClientRect(); const f = v => Math.min(N - 1, Math.max(0, Math.floor(v * N))); return [f((e.clientX - r.left) / r.width), f((e.clientY - r.top) / r.height)]; };
  const dab = (x, y) => { const v = S.tool === 'erase' ? '_' : G.CH[S.color]; ov[y * N + x] = v; if (S.mirror) ov[y * N + (N - 1 - x)] = v; };
  const show = () => G.draw(cv, G.compose({look:me().look, paint:ov.join('')}), false);
  cv.addEventListener('pointerdown', e => {
    e.preventDefault(); const [x, y] = cellAt(e);
    if (S.tool === 'pick'){ const v = G.compose(me())[y * N + x]; if (v >= 0){ S.color = v; S.tool = 'brush'; renderPaint(); } return; }
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    S.undo.push(me().paint); if (S.undo.length > 60) S.undo.shift();
    ov = (me().paint || '.'.repeat(N * N)).split(''); last = [x, y]; dab(x, y); show();
  });
  cv.addEventListener('pointermove', e => { if (!ov) return; const [x, y] = cellAt(e), [px, py] = last, n = Math.max(Math.abs(x - px), Math.abs(y - py)); for (let i = 1; i <= n; i++) dab(Math.round(px + (x - px) * i / n), Math.round(py + (y - py) * i / n)); last = [x, y]; show(); });
  const end = () => { if (!ov) return; const s = ov.join(''); ov = null; savePlayer({paint:/^\.+$/.test(s) ? null : s, custom:null}); };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
})();

/* ---------- backpack ---------- */
async function moveItem(from, to, itemId){
  let name = null;
  await DB.tx(async t => {
    const a = await t.get('players/' + from), b = await t.get('players/' + to);
    const it = a && (a.inv || []).find(i => i.id === itemId);
    if (!it || !b) return;
    t.update('players/' + from, {inv:a.inv.filter(i => i.id !== itemId)});
    t.update('players/' + to, {inv:(b.inv || []).concat([it])});
    name = G.ARTBY[it.a] ? G.ARTBY[it.a].name : 'an artefact';
  });
  return name;
}
function renderPack(){
  const p = me();
  $('wallet').textContent = fmt(p.coupons);
  $('packNote').textContent = 'Artefacts pay for cocktails at the bar. Win more at dice and in challenges, or buy them from ' + hostName() + ' for coupons.';
  if (S.sel && !p.inv.find(i => i.id === S.sel)) S.sel = null;
  if (!S.sel && p.inv.length) S.sel = p.inv[0].id;
  const cells = p.inv.map(it => {
    const a = G.ARTBY[it.a], b = el('button', 'cell'); b.type = 'button';
    b.style.setProperty('--rc', G.rarColor(a.r)); b.setAttribute('aria-pressed', it.id === S.sel); b.setAttribute('aria-label', a.name);
    b.append(el('span', 'glow'), G.artIcon(a, 56));
    b.addEventListener('click', () => { S.sel = it.id; renderPack(); showCocktail(it.a); });
    return b;
  });
  const total = Math.max(16, Math.ceil((cells.length + 1) / 8) * 8);
  while (cells.length < total){ const e = el('div', 'cell empty'); e.setAttribute('aria-hidden', 'true'); cells.push(e); }
  $('packGrid').replaceChildren(...cells);
  const box = $('detail'), it = p.inv.find(i => i.id === S.sel);
  if (!it){ box.replaceChildren(el('h2', '', 'Empty backpack'), el('p', 'note', 'Win artefacts at dice, or earn them at the party.')); return; }
  const a = G.ARTBY[it.a];
  const big = el('div', 'big'); big.append(G.artIcon(a, 84));
  const rar = el('span', 'tag', G.RAR[a.r].n); rar.style.color = G.rarColor(a.r);
  const kv = el('dl', 'kv');
  [['Anomaly', G.TYPES[a.type].label], ['Value', fmt(G.RAR[a.r].v) + ' coupons']].forEach(([k, v]) => kv.append(el('dt', '', k), el('dd', 'mono', v)));
  const others = Object.entries(S.players).filter(([id]) => id !== pid);
  const head = el('div', 'row'); head.style.justifyContent = 'center'; head.append(rar);
  const rb = el('button', 'btn primary recipe-btn', COCKTAILS[a.name] ? 'Show cocktail recipe' : ''); rb.type = 'button'; rb.hidden = !COCKTAILS[a.name];
  rb.addEventListener('click', () => showCocktail(a.name));
  const parts = [big, el('h2', '', a.name), head, el('p', 'muted', a.line), kv, rb];
  if (others.length){
    const give = el('div', 'field'), lab = el('label', '', 'Give to'), sel = el('select'), btn = el('button', 'btn', 'Give'), r = el('div', 'row');
    lab.htmlFor = 'giveTo'; sel.id = 'giveTo'; btn.type = 'button';
    others.forEach(([id, o]) => { const op = el('option', '', nameOf(o)); op.value = id; sel.append(op); });
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try { const n = await moveItem(pid, sel.value, it.id); if (n){ radio(nameOf(me()) + ' gave ' + n + ' to ' + nameOf(S.players[sel.value]) + '.'); toast(n + ' handed over.'); S.sel = null; } }
      catch (e) { console.error(e); toast('Could not hand it over. Try again.'); btn.disabled = false; }
    });
    r.append(sel, btn); give.append(lab, r); parts.push(give);
  }
  box.replaceChildren(...parts);
}

/* ---------- dice ---------- */
const byNew = (a, b) => (b.t || 0) - (a.t || 0);
const mine = () => S.games.filter(g => !S.dismissed.has(g.id));
const incoming = () => mine().filter(g => g.status === 'invited' && g.b === pid).sort(byNew);
const outgoing = () => mine().find(g => g.status === 'invited' && g.a === pid);
const liveGame = () => mine().filter(g => g.status === 'live' || g.status === 'over').sort(byNew)[0];
const busyIds = () => new Set(S.games.filter(g => g.status === 'live').flatMap(g => g.players));
function dismiss(id){ S.dismissed.add(id); ls.set('zone-dismissed', JSON.stringify([...S.dismissed].slice(-50))); }
function view(){
  if (S.local) return {kind:'local', s:S.local.s, meta:S.local};
  const g = liveGame(); return g ? {kind:'live', s:g.s, meta:g} : null;
}
const myIdx = v => v.kind === 'local' ? 0 : (v.meta.a === pid ? 0 : 1);
function canAct(v){
  if (v.s.phase === 'over' || S.acting) return false;
  if (v.kind === 'local') return v.meta.mode === 'seat' || v.s.turn === 0;
  return v.meta.status === 'live' && v.s.turn === myIdx(v);
}
const playersOf = v => v.kind === 'local' ? [me(), v.meta.mode === 'bot' ? {name:'PDA', look:{skin:0, hairC:0, face:0, helmet:9, suit:8, faction:3}} : S.players[v.meta.b]] : [S.players[v.meta.a], S.players[v.meta.b]];

function settle(ps, w, stake, arts){
  const out = ps.map(p => ({coupons:(p && p.coupons) || 0, inv:((p && p.inv) || []).slice()}));
  const win = out[w], lose = out[1 - w], moved = [];
  if (stake){ const amt = Math.min(stake, lose.coupons); lose.coupons -= amt; win.coupons += amt; if (amt) moved.push(fmt(amt) + ' coupons'); }
  const id = arts[1 - w];
  if (id){ const it = lose.inv.find(i => i.id === id); if (it){ lose.inv = lose.inv.filter(i => i !== it); win.inv.push(it); moved.push(G.ARTBY[it.a] ? G.ARTBY[it.a].name : 'an artefact'); } }
  return {out, moved};
}
async function finishGame(meta, s, kind, mut){
  let line = null;
  const ref = kind === 'live' ? 'games/' + meta.id : null;
  await DB.tx(async t => {
    let g = meta, st = s;
    if (ref){ g = await t.get(ref); if (!g || g.status !== 'live') return; if (mut){ st = g.s; mut(st); } }
    const pa = await t.get('players/' + g.a), pb = await t.get('players/' + g.b);
    const {out, moved} = settle([pa, pb], st.winner, g.stake, [g.artA, g.artB]);
    t.update('players/' + g.a, out[0]); t.update('players/' + g.b, out[1]);
    if (ref) t.update(ref, {s:st, status:'over', t:Date.now()});
    const w = st.winner, names = [nameOf(pa), nameOf(pb)];
    line = names[w] + ' beat ' + names[1 - w] + ' at dice, ' + fmt(st.scores[w]) + ' to ' + fmt(st.scores[1 - w]) + (moved.length ? '. Won ' + moved.join(' and ') : '') + '.';
  });
  if (line) radio(line);
}
async function act(fn){
  const v = view(); if (!v) return;
  fn(v.s);
  if (v.kind === 'local'){
    if (v.s.phase === 'over' && v.meta.mode === 'seat'){ S.acting = true; renderDice(); try { await finishGame(v.meta, v.s, 'local'); } catch (e) { toast('Could not record the result.'); } S.acting = false; }
    renderDice();
    if (v.meta.mode === 'bot' && v.s.turn === 1 && v.s.phase !== 'over') botRun();
    return;
  }
  S.acting = true; renderDice();
  try {
    if (v.s.phase === 'over') await finishGame(v.meta, v.s, 'live');
    else await DB.update('games/' + v.meta.id, {s:v.s, t:Date.now()});
  } catch (e) { console.error(e); toast('Lost contact. Try that again.'); }
  S.acting = false; renderDice();
}
async function botRun(){
  const meta = S.local;
  while (S.local === meta && meta.s.turn === 1 && meta.s.phase !== 'over'){
    await sleep(750); if (S.local !== meta) return;
    if (meta.s.phase === 'start'){ D.roll(meta.s); renderDice(); continue; }
    const pick = D.botPick(meta.s); if (!pick){ D.bank(meta.s); renderDice(); continue; } pick.pick.forEach(i => meta.s.dice[i].sel = true); renderDice();
    await sleep(850); if (S.local !== meta) return;
    if (D.botStops(meta.s, pick)) D.bank(meta.s); else D.throwOn(meta.s);
    renderDice();
  }
}

function renderSetup(){
  const busy = busyIds(), others = Object.entries(S.players).filter(([id]) => id !== pid);
  document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === S.mode));
  $('modeNote').textContent = {phone:'They get the challenge on their own phone and play from there.', seat:'You both sit at this phone and take turns.', bot:'The PDA plays against you. Nothing is at stake.'}[S.mode];
  const bot = S.mode === 'bot';
  $('oppField').hidden = bot; $('stakeRow').hidden = bot;
  if (!bot){
    if (!S.opp || !S.players[S.opp] || S.opp === pid) S.opp = others.length ? others[0][0] : null;
    $('opps').replaceChildren(...others.map(([id, o]) => {
      const b = el('button', 'opp'); b.type = 'button'; b.setAttribute('aria-pressed', id === S.opp);
      const isBusy = S.mode === 'phone' && busy.has(id);
      b.disabled = isBusy;
      b.append(G.portrait(o), el('span', '', nameOf(o)), el('small', '', isBusy ? 'in a game' : fmt(o.coupons) + ' c'));
      b.addEventListener('click', () => { S.opp = id; renderSetup(); });
      return b;
    }));
    const opp = S.players[S.opp], cap = Math.min(me().coupons, opp ? opp.coupons : 0), prev = $('stake').value;
    $('stake').replaceChildren(...[0, 100, 250, 500, 1000].filter(v => v <= cap).map(v => { const o = el('option', '', v ? fmt(v) + ' coupons' : 'Just for fun'); o.value = v; return o; }));
    if ([...$('stake').options].some(o => o.value === prev)) $('stake').value = prev;
    const prevA = $('stakeArt').value, none = el('option', '', 'No artefact'); none.value = '';
    $('stakeArt').replaceChildren(none, ...me().inv.map(it => { const a = G.ARTBY[it.a], o = el('option', '', a.name + ' (' + G.RAR[a.r].n.toLowerCase() + ')'); o.value = it.id; return o; }));
    if ([...$('stakeArt').options].some(o => o.value === prevA)) $('stakeArt').value = prevA;
  }
  const blocked = !bot && (!S.opp || (S.mode === 'phone' && (busy.has(S.opp) || busy.has(pid) || !!outgoing())));
  $('btnStart').disabled = blocked;
  $('btnStart').textContent = S.mode === 'phone' ? 'Send challenge' : 'Start';
  $('setupNote').textContent = !others.length && !bot ? 'Nobody else has joined yet.' : (S.mode === 'phone' && busy.has(pid) ? 'Finish your current game first.' : '');
}
document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { S.mode = b.dataset.mode; renderSetup(); }));
$('btnStart').addEventListener('click', async () => {
  const p = me();
  if (S.mode === 'bot'){ S.local = {mode:'bot', a:pid, b:null, stake:0, artA:null, artB:null, s:D.fresh([nameOf(p), 'PDA'])}; S.local.s.log.unshift('Practice against the PDA. First to 2,000.'); renderDice(); return; }
  const opp = S.players[S.opp]; if (!opp) return;
  const stake = +$('stake').value || 0, artA = $('stakeArt').value || null;
  if (S.mode === 'seat'){
    let artB = null;
    if (artA && opp.inv.length){ const v = G.RAR[G.ARTBY[p.inv.find(i => i.id === artA).a].r].v; artB = opp.inv.slice().sort((x, y) => Math.abs(G.RAR[G.ARTBY[x.a].r].v - v) - Math.abs(G.RAR[G.ARTBY[y.a].r].v - v))[0].id; }
    S.local = {mode:'seat', a:pid, b:opp.id || S.opp, stake, artA, artB, s:D.fresh([nameOf(p), nameOf(opp)])};
    S.local.b = S.opp;
    S.local.s.log.unshift(potLine(stake, artA, artB, pid, S.opp));
    renderDice(); return;
  }
  $('btnStart').disabled = true;
  try {
    const s = D.fresh([nameOf(p), nameOf(opp)]);
    s.log.unshift(potLine(stake, artA, null, pid, S.opp));
    await DB.add('games', {players:[pid, S.opp], a:pid, b:S.opp, status:'invited', stake, artA, artB:null, s, t:Date.now()});
    toast('Challenge sent to ' + nameOf(opp) + '.');
  } catch (e) { console.error(e); toast('Could not send the challenge.'); $('btnStart').disabled = false; }
});
function potLine(stake, artA, artB, a, b){
  const art = (who, id) => { const it = id && S.players[who] && S.players[who].inv.find(i => i.id === id); return it ? G.ARTBY[it.a].name : null; };
  const bits = [stake ? fmt(stake) + ' coupons each' : 'no coupons'];
  const x = art(a, artA), y = art(b, artB); if (x) bits.push(x); if (y) bits.push(y);
  return 'On the line: ' + bits.join(', ') + '.';
}
function renderIncoming(){
  const g = incoming()[0], box = $('incoming');
  box.hidden = !g || !!view(); if (box.hidden) return;
  const from = S.players[g.a], artIt = g.artA && from && from.inv.find(i => i.id === g.artA);
  const parts = [el('h2', '', nameOf(from) + ' challenges you to dice'), el('p', '', (g.stake ? fmt(g.stake) + ' coupons each' : 'No coupons') + (artIt ? ', and they put ' + G.ARTBY[artIt.a].name + ' on the line.' : '.'))];
  let sel = null;
  if (g.artA){
    const f = el('div', 'field'), lab = el('label', '', 'Your artefact to match'); sel = el('select'); sel.id = 'matchArt'; lab.htmlFor = 'matchArt';
    me().inv.forEach(it => { const a = G.ARTBY[it.a], o = el('option', '', a.name + ' (' + G.RAR[a.r].n.toLowerCase() + ')'); o.value = it.id; sel.append(o); });
    f.append(lab, sel); parts.push(f);
  }
  const short = me().coupons < g.stake || (g.artA && !me().inv.length) || busyIds().has(pid);
  if (short) parts.push(el('p', 'note', busyIds().has(pid) ? 'Finish your current game first.' : 'You don’t have enough to match this bet.'));
  const yes = el('button', 'btn primary', 'Accept'), no = el('button', 'btn', 'Decline'), r = el('div', 'row');
  yes.type = no.type = 'button'; yes.disabled = short;
  yes.addEventListener('click', async () => {
    yes.disabled = no.disabled = true;
    const artB = sel ? sel.value : null;
    try {
      const s = g.s; if (artB){ const it = me().inv.find(i => i.id === artB); s.log.unshift(nameOf(me()) + ' matches with ' + G.ARTBY[it.a].name + '.'); }
      s.log.unshift(nameOf(me()) + ' accepts. First to 2,000.');
      await DB.update('games/' + g.id, {status:'live', artB, s, t:Date.now()});
    } catch (e) { toast('Could not accept. Try again.'); yes.disabled = no.disabled = false; }
  });
  no.addEventListener('click', () => DB.update('games/' + g.id, {status:'declined', t:Date.now()}).then(() => radio(nameOf(me()) + ' turned down a game with ' + nameOf(from) + '.')));
  r.append(yes, no); parts.push(r);
  box.replaceChildren(...parts);
}
function renderWaiting(){
  const g = outgoing(), box = $('waiting');
  box.hidden = !g || !!view(); if (box.hidden) return;
  const b = el('button', 'btn', 'Cancel challenge'); b.type = 'button';
  b.addEventListener('click', () => DB.update('games/' + g.id, {status:'cancelled', t:Date.now()}));
  box.replaceChildren(el('h2', '', 'Waiting for ' + nameOf(S.players[g.b])), el('p', 'muted', 'They’ll see your challenge when they open the Dice tab.'), b);
}
function renderDice(){
  if (S.tab !== 'dice') { renderBadge(); return; }
  renderIncoming(); renderWaiting();
  const v = view();
  $('setup').hidden = !!v || !!outgoing();
  $('table').hidden = !v;
  if (!v){ renderSetup(); $('gameLog').replaceChildren(el('li', '', 'No game yet.')); renderBadge(); return; }
  if (v.kind === 'live' && v.meta.status === 'live' && incoming().length) {} // invites wait until this game ends
  const s = v.s, ps = playersOf(v), idx = myIdx(v), act0 = canAct(v);
  $('score').replaceChildren(...ps.map((p, i) => {
    const box = el('div', 'player' + (s.turn === i && s.phase !== 'over' ? ' turn' : ''));
    const m = el('div', 'meter'), bar = el('i'); bar.style.width = Math.min(100, s.scores[i] / D.TARGET * 100) + '%'; m.append(bar);
    box.append(G.portrait(p), el('b', '', s.names[i]), el('span', 'mono', fmt(s.scores[i])), m);
    return box;
  }));
  const st = $('status');
  if (s.phase === 'over'){
    const won = v.kind === 'local' ? (v.meta.mode === 'seat' ? null : s.winner === 0) : s.winner === idx;
    st.textContent = (won === null ? s.names[s.winner] + ' wins' : won ? 'You win' : s.names[s.winner] + ' wins') + (v.kind === 'live' && v.meta.status !== 'over' ? '. Recording…' : '');
    st.className = 'status ' + (won === false ? 'bad' : 'good');
  } else {
    const who = s.names[s.turn];
    const mineTurn = v.kind === 'local' ? (v.meta.mode === 'seat' || s.turn === 0) : s.turn === idx;
    let t = s.phase === 'start' ? (mineTurn ? (v.kind === 'local' && v.meta.mode === 'seat' ? who + ', your throw' : 'Your throw') : who + ' is up') : (mineTurn ? 'Pick the dice to keep' : who + ' is choosing');
    if (s.note && s.phase === 'start') t = s.note + ' ' + t + '.';
    st.textContent = t; st.className = 'status' + (s.note && /nothing/.test(s.note) && s.phase === 'start' ? ' bad' : '');
  }
  const sel = D.selected(s), proj = D.projected(s);
  $('turnPts').textContent = fmt(s.phase === 'over' ? 0 : D.turnValue(s));
  $('selPts').textContent = s.phase === 'choose' ? fmt(proj) : '0';
  $('diceLeft').textContent = s.phase === 'start' ? 6 : D.live(s).length;
  const liveDice = s.phase === 'start' || s.phase === 'over' ? [] : s.dice.map((d, i) => [d, i]).filter(([d]) => !d.used);
  $('throw').replaceChildren(...(liveDice.length ? liveDice.map(([d, i]) => dieNode(d, i, false, act0)) : [el('span', 'note', s.phase === 'over' ? 'Game over.' : 'Dice are in the cup.')]));
  const kept = s.dice.filter(d => d.used);
  $('kept').replaceChildren(...(kept.length && s.phase !== 'over' ? kept.map((d, i) => dieNode(d, i, true, false)) : [el('span', 'note', 'Nothing set aside yet.')]));
  const canThrow = D.canThrowOn(s), left = D.live(s).length - sel.length;
  $('btnThrow').disabled = !act0 || !canThrow;
  $('btnThrow').textContent = s.phase === 'choose' && sel.length ? 'Set aside & throw ' + (left || 6) : 'Throw';
  $('btnBank').disabled = !act0 || !D.canBank(s);
  $('btnBank').textContent = s.phase === 'choose' && proj > 0 ? 'Bank ' + fmt(proj) : 'Bank';
  const over = s.phase === 'over';
  $('btnQuit').textContent = over ? 'Back to the fire' : (v.kind === 'local' && v.meta.mode === 'bot' ? 'Stop practice' : 'Give up');
  $('btnQuit').disabled = over && v.kind === 'live' && v.meta.status !== 'over';
  $('gameLog').replaceChildren(...s.log.map(t => el('li', '', t)));
  const key = v.kind === 'live' ? v.meta.id : 'local';
  if (S.lastRoll[key] !== undefined && S.lastRoll[key] !== s.rollN && !reduced() && liveDice.length) shake();
  S.lastRoll[key] = s.rollN;
  renderBadge();
}
const PIPS = {1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
function paintDie(b, v){ [...b.children].forEach((pip, p) => pip.className = PIPS[v].includes(p) ? 'on' : ''); }
function dieNode(d, i, kept, enabled){
  const b = el('button', 'die'); b.type = 'button'; b.dataset.v = d.v;
  for (let p = 0; p < 9; p++) b.append(el('i'));
  paintDie(b, d.v);
  b.setAttribute('aria-label', 'Die showing ' + d.v + (kept ? ', kept' : ''));
  if (!kept && d.sel) b.setAttribute('aria-pressed', 'true');
  if (kept || !enabled) b.disabled = true;
  else { b.setAttribute('aria-pressed', !!d.sel); b.addEventListener('click', () => act(s => D.toggle(s, i))); }
  return b;
}
async function shake(){
  const dice = [...$('throw').querySelectorAll('.die')];
  for (let f = 0; f < 6; f++){ dice.forEach(b => { b.classList.add('rolling'); paintDie(b, 1 + Math.floor(Math.random() * 6)); }); await sleep(55); }
  dice.forEach(b => { b.classList.remove('rolling'); paintDie(b, +b.dataset.v); });
}
$('btnThrow').addEventListener('click', () => act(s => D.throwOn(s)));
$('btnBank').addEventListener('click', () => act(s => D.bank(s)));
$('btnQuit').addEventListener('click', () => {
  const v = view(); if (!v) return;
  if (v.s.phase === 'over' || (v.kind === 'local' && v.meta.mode === 'bot')){ if (v.kind === 'local') S.local = null; else dismiss(v.meta.id); $('quitConfirm').hidden = true; renderDice(); return; }
  $('quitText').textContent = 'Give up? ' + (v.kind === 'local' ? 'The other player' : 'Your opponent') + ' wins the pot.';
  $('quitConfirm').hidden = false;
});
$('btnQuitNo').addEventListener('click', () => { $('quitConfirm').hidden = true; });
$('btnQuitYes').addEventListener('click', async () => {
  $('quitConfirm').hidden = true;
  const v = view(); if (!v) return;
  if (v.kind === 'local'){ act(s => D.forfeit(s, v.meta.mode === 'seat' ? v.s.turn : 0)); return; }
  S.acting = true; renderDice();
  try { await finishGame(v.meta, null, 'live', s => D.forfeit(s, myIdx(v))); } catch (e) { toast('Lost contact. Try again.'); }
  S.acting = false; renderDice();
});

/* ---------- camp ---------- */
function roster(){ return Object.entries(S.players).sort(([a, x], [b, y]) => (b === 'host') - (a === 'host') || (x.t || 0) - (y.t || 0)); }
function renderCamp(){
  $('roster').replaceChildren(...roster().map(([id, p]) => {
    const c = el('div', 'contact' + (id === pid ? ' me' : ''));
    const tag = el('span', 'tag'); factionTag(tag, G.FACTIONS[p.look.faction]);
    const head = el('div', 'row'); head.style.gap = '8px'; head.append(el('b', '', nameOf(p)), tag);
    const minis = el('div', 'minis'); p.inv.slice(0, 10).forEach(it => minis.append(G.artIcon(G.ARTBY[it.a])));
    const status = id === pid ? 'You' : p.host ? 'Host' : p.rsvp === 'yes' ? 'Coming' : p.rsvp === 'no' ? 'Can’t make it' : 'No reply yet';
    c.append(G.portrait(p), head, el('span', 'mono muted', fmt(p.coupons) + ' coupons · ' + p.inv.length + ' artefacts'), minis, el('small', 'note', status));
    return c;
  }));
  $('feed').replaceChildren(...(S.feed.length ? S.feed.map(f => { const li = el('li'), d = new Date(f.t); li.append(el('time', '', d.toTimeString().slice(0, 5)), el('span', '', f.text)); return li; }) : [el('li', 'note', 'Quiet so far.')]));
}

/* ---------- host ---------- */
const linkFor = token => location.origin + location.pathname + '?id=' + token;
async function adjust(id, fn){ await DB.tx(async t => { const p = await t.get('players/' + id); if (!p) return; t.update('players/' + id, fn(p)); }); }
function renderHost(){
  if (!isHost) return;
  renderEmiHost();
  ['when', 'where', 'note'].forEach(k => { const i = $('p' + k[0].toUpperCase() + k.slice(1)); if (document.activeElement !== i && !i.dataset.dirty) i.value = S.party[k] || ''; });
  $('hostList').replaceChildren(...roster().map(([id, p]) => {
    const row = el('div', 'hrow'), body = el('div', 'tab'); body.style.gap = '10px';
    const nameF = el('input'); nameF.value = p.name || ''; nameF.maxLength = 16; nameF.setAttribute('aria-label', 'Name');
    nameF.addEventListener('change', () => DB.update('players/' + id, {name:nameF.value.trim() || 'Stalker'}));
    const tagline = el('span', 'note', (p.host ? 'You · ' : '') + (p.rsvp === 'yes' ? 'Coming' : p.rsvp === 'no' ? 'Can’t make it' : 'No reply yet') + ' · ' + fmt(p.coupons) + ' coupons');
    const r1 = el('div', 'row'); r1.append(nameF, tagline);
    const r2 = el('div', 'row');
    [-100, 100, 500].forEach(d => { const b = el('button', 'btn', (d > 0 ? '+' : '−') + Math.abs(d)); b.type = 'button'; b.addEventListener('click', () => adjust(id, q => ({coupons:Math.max(0, (q.coupons || 0) + d)}))); r2.append(b); });
    const artSel = el('select'); artSel.setAttribute('aria-label', 'Artefact to give');
    G.ART.forEach(a => { const o = el('option', '', a.name + ' · ' + G.RAR[a.r].n); o.value = a.name; artSel.append(o); });
    const give = el('button', 'btn', 'Give'); give.type = 'button';
    give.addEventListener('click', () => adjust(id, q => ({inv:(q.inv || []).concat([{id:G.uid(), a:artSel.value}])})).then(() => radio('The host gave ' + nameOf(p) + ' a ' + artSel.value + '.')));
    r2.append(artSel, give);
    const inv = el('div', 'hinv');
    p.inv.forEach(it => { const b = el('button'); b.type = 'button'; b.title = 'Take ' + it.a + ' away'; b.setAttribute('aria-label', 'Take ' + it.a + ' away'); b.append(G.artIcon(G.ARTBY[it.a])); b.addEventListener('click', () => adjust(id, q => ({inv:(q.inv || []).filter(i => i.id !== it.id)}))); inv.append(b); });
    body.append(r1, r2, inv);
    if (!p.host && S.links[id]){
      const line = el('div', 'linkline'), inp = el('input'); inp.readOnly = true; inp.value = linkFor(S.links[id]); inp.setAttribute('aria-label', 'Personal link for ' + nameOf(p));
      const copy = el('button', 'btn', 'Copy link'); copy.type = 'button';
      copy.addEventListener('click', () => { const done = () => toast('Link for ' + nameOf(p) + ' copied.'); try { navigator.clipboard.writeText(inp.value).then(done, () => { inp.select(); toast('Press copy on your keyboard.'); }); } catch (e) { inp.select(); } });
      line.append(inp, copy); body.append(line);
    }
    row.append(G.portrait(p), body);
    return row;
  }));
}
['pWhen', 'pWhere', 'pNote'].forEach(id => $(id).addEventListener('input', () => { $(id).dataset.dirty = '1'; }));
$('btnParty').addEventListener('click', async () => {
  try { await DB.set('config/party', {when:$('pWhen').value.trim(), where:$('pWhere').value.trim(), note:$('pNote').value.trim()}); ['pWhen', 'pWhere', 'pNote'].forEach(id => delete $(id).dataset.dirty); toast('Party details saved.'); }
  catch (e) { toast('Could not save. Check your connection.'); }
});
$('btnResetPacks').addEventListener('click', () => { $('resetPacksConfirm').hidden = false; });
$('btnResetPacksNo').addEventListener('click', () => { $('resetPacksConfirm').hidden = true; });
$('btnResetPacksYes').addEventListener('click', async () => {
  $('resetPacksConfirm').hidden = true; $('btnResetPacks').disabled = true;
  try {
    for (const id of Object.keys(S.players)){
      const a = G.ART[Math.floor(Math.random() * G.ART.length)].name;
      await DB.update('players/' + id, {inv:[{id:G.uid(), a}]});
    }
    radio('The Zone shifted. Every stalker\u2019s backpack now holds one fresh artefact.');
    toast('Done: everyone has one random artefact.');
  } catch (e) { console.error(e); toast('Could not finish. Press it again.'); }
  $('btnResetPacks').disabled = false;
});
$('btnAddGuest').addEventListener('click', async () => {
  const name = $('gName').value.trim(); if (!name){ $('gName').focus(); return; }
  const id = DB.newId(), token = randomToken();
  $('btnAddGuest').disabled = true;
  try {
    await DB.set('players/' + id, newPlayer(name, false));
    await DB.set('keys/' + token, {pid:id});
    await DB.set('links/' + id, {token});
    $('gName').value = ''; toast('Link for ' + name + ' is ready below.');
  } catch (e) { console.error(e); toast('Could not create the link.'); }
  $('btnAddGuest').disabled = false;
});

$('cocktailClose').addEventListener('click', hideCocktail);
$('cocktail').addEventListener('click', e => { if (e.target.id === 'cocktail') hideCocktail(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('cocktail').hidden) hideCocktail(); });

/* ---------- quiz of the zone ---------- */
// The 600 stake is taken when the quiz starts; 3/3 pays back 1,100 (net +500).
// So leaving or reloading mid-quiz counts as a loss.
const QUIZ_WIN = 500, QUIZ_LOSS = 600;
let Q = null; // {qs:[{text, opts, right}], i, picked, results:[], done, busy}
function quizPick(){
  let seen = [];
  try { seen = JSON.parse(ls.get('zone-quiz-seen') || '[]'); } catch (e) {}
  let pool = QUESTIONS.map((q, i) => i).filter(i => !seen.includes(i));
  if (pool.length < 3){ seen = []; pool = QUESTIONS.map((q, i) => i); }
  const ids = [];
  while (ids.length < 3){ const k = pool.splice(Math.floor(Math.random() * pool.length), 1)[0]; ids.push(k); }
  ls.set('zone-quiz-seen', JSON.stringify(seen.concat(ids)));
  return ids.map(k => { const [text, right, ...wrong] = QUESTIONS[k]; const opts = [right, ...wrong]; for (let i = opts.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; } return {text, opts, right}; });
}
async function quizStart(){
  if (Q && Q.busy) return;
  Q = {busy:true}; renderQuiz();
  try {
    let ok = false;
    await DB.tx(async t => { const p = await t.get('players/' + pid); if (!p || (p.coupons || 0) < QUIZ_LOSS) return; t.update('players/' + pid, {coupons:p.coupons - QUIZ_LOSS}); ok = true; });
    if (!ok){ Q = null; toast('You need ' + fmt(QUIZ_LOSS) + ' coupons to take the quiz.'); renderQuiz(); return; }
    Q = {qs:quizPick(), i:0, picked:null, results:[], done:false, busy:false};
  } catch (e) { console.error(e); Q = null; toast('Lost contact. Try again.'); }
  renderQuiz();
}
async function quizAnswer(opt){
  if (!Q || Q.done || Q.picked !== null) return;
  const q = Q.qs[Q.i]; Q.picked = opt;
  const right = opt === q.right; Q.results.push(right);
  if (!right){ Q.done = true; radio(nameOf(me()) + ' failed the Quiz of the Zone and lost ' + fmt(QUIZ_LOSS) + ' coupons.'); }
  else if (Q.results.length === 3){
    Q.done = true; Q.busy = true; renderQuiz();
    try { await DB.tx(async t => { const p = await t.get('players/' + pid); t.update('players/' + pid, {coupons:(p.coupons || 0) + QUIZ_LOSS + QUIZ_WIN}); }); radio(nameOf(me()) + ' got all three right in the Quiz of the Zone and won ' + fmt(QUIZ_WIN) + ' coupons.'); }
    catch (e) { console.error(e); toast('Could not pay out. Tell the host.'); }
    Q.busy = false;
  }
  renderQuiz();
}
function quizNext(){ if (!Q || Q.done) return; Q.i++; Q.picked = null; renderQuiz(); }
function renderQuiz(){
  const box = $('quizBox');
  if (!Q || !Q.qs){
    const poor = me().coupons < QUIZ_LOSS;
    const b = el('button', 'btn primary', Q && Q.busy ? 'Starting…' : 'Start the quiz'); b.type = 'button'; b.disabled = poor || !!(Q && Q.busy);
    b.addEventListener('click', quizStart);
    const rules = el('ul'); rules.style.margin = '0'; rules.style.paddingLeft = '1.2rem';
    ['Three random questions about the Zone, multiple choice.', 'All three right: you win ' + fmt(QUIZ_WIN) + ' coupons.', 'One wrong answer: you lose ' + fmt(QUIZ_LOSS) + ' coupons and the quiz ends.', 'Leaving the quiz halfway counts as a loss.'].forEach(t => rules.append(el('li', '', t)));
    box.replaceChildren(el('h2', '', 'Quiz of the Zone'), rules, el('div', 'row'), poor ? el('p', 'note', 'You need at least ' + fmt(QUIZ_LOSS) + ' coupons to play.') : el('span'));
    box.querySelector('.row').append(b);
    return;
  }
  const q = Q.qs[Q.i], dots = el('div', 'qdots');
  for (let k = 0; k < 3; k++){ const d = el('i'); d.className = k < Q.results.length ? (Q.results[k] ? 'ok' : 'no') : k === Q.i ? 'now' : ''; dots.append(d); }
  const opts = el('div', 'qopts');
  q.opts.forEach(o => {
    const b = el('button', 'qopt', o); b.type = 'button';
    if (Q.picked !== null){ b.disabled = true; if (o === q.right) b.classList.add('right'); else if (o === Q.picked) b.classList.add('wrong'); }
    b.addEventListener('click', () => quizAnswer(o));
    opts.append(b);
  });
  const parts = [dots, el('p', 'qnum', 'Question ' + (Q.i + 1) + ' of 3'), el('p', 'qtext', q.text), opts];
  if (Q.picked !== null){
    const row = el('div', 'row');
    if (!Q.done){ const n = el('button', 'btn primary', 'Next question'); n.type = 'button'; n.addEventListener('click', quizNext); row.append(n); }
    else {
      const won = Q.results.length === 3 && Q.results.every(Boolean);
      parts.push(el('p', 'qresult ' + (won ? 'good' : 'bad'), won ? 'All three right! +' + fmt(QUIZ_WIN) + ' coupons' : 'Wrong. −' + fmt(QUIZ_LOSS) + ' coupons'));
      const again = el('button', 'btn primary', Q.busy ? 'Paying out…' : 'Play again'); again.type = 'button'; again.disabled = Q.busy;
      again.addEventListener('click', () => { Q = null; quizStart(); });
      const back = el('button', 'btn', 'Done'); back.type = 'button'; back.addEventListener('click', () => { Q = null; renderQuiz(); });
      row.append(again, back);
    }
    parts.push(row);
  }
  box.replaceChildren(...parts);
}

/* ---------- emission ---------- */
// config/emission: {id, start, warn, dur, stopped, auto, minMin, maxMin, nextAt}
S.emi = {};
const emiPhase = (e, now) => {
  if (!e || !e.id || e.stopped || !e.start) return 'calm';
  const t = now - e.start, w = (e.warn || 45) * 1000, d = (e.dur || 30) * 1000;
  return t < 0 ? 'calm' : t < w ? 'warning' : t < w + d ? 'blowout' : 'calm';
};
let emiShownFor = null, emiHidden = null, emiLastPhase = 'calm';
// Lightning times inside the blowout (ms after it starts). The lamp program on the PC
// computes the same times from the emission id, so screens, thunder and lamp flash together.
function strikes(id, durMs){
  let s = 0; for (const ch of String(id)) s = (Math.imul(s, 31) + ch.charCodeAt(0)) >>> 0;
  const out = []; let t = 600;
  while (t < durMs - 500){ out.push(t); s = (Math.imul(s, 1664525) + 1013904223) >>> 0; t += 5000 + (s / 4294967296) * 5000; }
  return out;
}
const SFX = {ctx:null, bus:null, white:null, brown:null, storm:null, timers:[], plannedFor:null};
['pointerdown', 'keydown'].forEach(ev => window.addEventListener(ev, () => { try { if (!SFX.ctx){ const C = window.AudioContext || window.webkitAudioContext; if (C) SFX.ctx = new C(); } else if (SFX.ctx.state === 'suspended') SFX.ctx.resume(); } catch (e) {} }, {passive:true}));
function sfxInit(){
  const ctx = SFX.ctx; if (!ctx) return null;
  if (!SFX.bus){
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 6;
    SFX.bus = ctx.createGain(); SFX.bus.gain.value = 1; SFX.bus.connect(comp).connect(ctx.destination);
    const len = ctx.sampleRate * 4;
    SFX.white = ctx.createBuffer(1, len, ctx.sampleRate); SFX.brown = ctx.createBuffer(1, len, ctx.sampleRate);
    const w = SFX.white.getChannelData(0), b = SFX.brown.getChannelData(0); let last = 0;
    for (let i = 0; i < len; i++){ const r = Math.random() * 2 - 1; w[i] = r; last = (last + 0.02 * r) / 1.02; b[i] = last * 3.5; }
  }
  return ctx;
}
const src = (ctx, buf, loop) => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = !!loop; return s; };
function stormLevel(level){
  const ctx = sfxInit(); if (!ctx) return;
  if (!SFX.storm){
    const wind = src(ctx, SFX.brown, true), wf = ctx.createBiquadFilter(), wg = ctx.createGain();
    wf.type = 'bandpass'; wf.frequency.value = 320; wf.Q.value = 0.6; wg.gain.value = 0;
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.13; lg.gain.value = 160; lfo.connect(lg).connect(wf.frequency);
    const rain = src(ctx, SFX.white, true), rf = ctx.createBiquadFilter(), rg = ctx.createGain();
    rf.type = 'highpass'; rf.frequency.value = 2500; rg.gain.value = 0;
    wind.connect(wf).connect(wg).connect(SFX.bus); rain.connect(rf).connect(rg).connect(SFX.bus);
    wind.start(); rain.start(); lfo.start();
    SFX.storm = {wg, rg, nodes:[wind, rain, lfo]};
  }
  const t = ctx.currentTime;
  SFX.storm.wg.gain.setTargetAtTime(0.9 * level, t, level ? 1.2 : 1.5);
  SFX.storm.rg.gain.setTargetAtTime(0.07 * level, t, level ? 1.2 : 1.5);
  if (!level){ const st = SFX.storm; SFX.storm = null; setTimeout(() => st.nodes.forEach(n => { try { n.stop(); } catch (e) {} }), 6000); }
}
function thunder(power){
  const ctx = sfxInit(); if (!ctx) return; const t = ctx.currentTime;
  if (power > 0.6){
    const c = src(ctx, SFX.white), cf = ctx.createBiquadFilter(), cg = ctx.createGain();
    cf.type = 'lowpass'; cf.frequency.setValueAtTime(5000, t); cf.frequency.exponentialRampToValueAtTime(250, t + 0.5);
    cg.gain.setValueAtTime(0, t); cg.gain.linearRampToValueAtTime(1.1 * power, t + 0.008); cg.gain.exponentialRampToValueAtTime(0.25 * power, t + 0.35); cg.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    c.connect(cf).connect(cg).connect(SFX.bus); c.start(t, Math.random() * 2); c.stop(t + 1.6);
  }
  const r = src(ctx, SFX.brown), rf = ctx.createBiquadFilter(), rg = ctx.createGain();
  rf.type = 'lowpass'; rf.frequency.value = power > 0.6 ? 220 : 140;
  const dly = power > 0.6 ? 0.05 : 0.2, len = 3 + Math.random() * 2;
  rg.gain.setValueAtTime(0, t); rg.gain.linearRampToValueAtTime(1.6 * power, t + dly + 0.25);
  for (let k = 1; k < 7; k++) rg.gain.linearRampToValueAtTime(1.6 * power * (1 - k / 7) * (0.55 + Math.random() * 0.45), t + dly + 0.25 + k * len / 7);
  rg.gain.linearRampToValueAtTime(0, t + dly + 0.3 + len);
  r.connect(rf).connect(rg).connect(SFX.bus); r.start(t, Math.random() * 2); r.stop(t + len + 1);
}
function flashScreen(){
  const box = $('emission'); if (box.hidden || reduced()) return;
  box.classList.add('flash'); setTimeout(() => box.classList.remove('flash'), 110);
  setTimeout(() => { box.classList.add('flash'); setTimeout(() => box.classList.remove('flash'), 80); }, 200);
}
function clearPlan(){ SFX.timers.forEach(clearTimeout); SFX.timers = []; SFX.plannedFor = null; }
function planWarning(e){
  clearPlan(); SFX.plannedFor = e.id + 'w';
  const end = e.start + (e.warn || 45) * 1000;
  const next = () => { const wait = 4000 + Math.random() * 6000; if (Date.now() + wait > end) return; SFX.timers.push(setTimeout(() => { thunder(0.35); next(); }, wait)); };
  next();
}
function planBlowout(e){
  clearPlan(); SFX.plannedFor = e.id + 'b';
  const begin = e.start + (e.warn || 45) * 1000, now = Date.now();
  strikes(e.id, (e.dur || 30) * 1000).forEach(ms => { const at = begin + ms; if (at > now) SFX.timers.push(setTimeout(() => { flashScreen(); thunder(1); }, at - now)); });
}
function emiTick(){
  const e = S.emi, now = Date.now(), ph = emiPhase(e, now), box = $('emission');
  if (ph !== emiLastPhase){
    if (ph === 'warning'){ stormLevel(0.3); try { navigator.vibrate && navigator.vibrate([400, 200, 400]); } catch (x) {} }
    else if (ph === 'blowout'){ stormLevel(1); try { navigator.vibrate && navigator.vibrate([1200, 300, 1200]); } catch (x) {} }
    else { stormLevel(0); clearPlan(); }
    if (emiLastPhase === 'blowout' && ph === 'calm' && S.ready) toast('The emission has passed.');
    emiLastPhase = ph;
  }
  if (ph === 'warning' && SFX.plannedFor !== e.id + 'w') planWarning(e);
  if (ph === 'blowout' && SFX.plannedFor !== e.id + 'b') planBlowout(e);
  if (ph === 'calm' || emiHidden === e.id + ph){ box.hidden = true; if (S.ready && S.tab === 'host') renderEmiStatus(); return; }
  box.hidden = false; box.classList.toggle('blow', ph === 'blowout'); $('emiStopHost').hidden = !isHost;
  const w = (e.warn || 45) * 1000, d = (e.dur || 30) * 1000;
  const left = Math.max(0, Math.ceil(((ph === 'warning' ? e.start + w : e.start + w + d) - now) / 1000));
  $('emiEyebrow').textContent = ph === 'warning' ? 'PDA warning' : 'Blowout';
  $('emiTitle').textContent = ph === 'warning' ? 'Emission incoming' : 'Emission';
  $('emiSub').textContent = ph === 'warning' ? 'Get to shelter now. Anyone caught outside loses an artefact.' : 'Stay in shelter until it passes.';
  $('emiCount').textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
  if (S.ready && S.tab === 'host') renderEmiStatus();
}
setInterval(emiTick, 250);
$('emiStopHost').addEventListener('click', () => DB.set('config/emission', Object.assign({}, S.emi, {stopped:true})));
$('emiHide').addEventListener('click', () => { emiHidden = (S.emi.id || '') + emiPhase(S.emi, Date.now()); emiTick(); });
const emiNum = (id, lo, hi, def) => { const v = Math.round(+$(id).value); return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : def; };
function nextRandom(e, from){ const lo = (e.minMin || 40), hi = Math.max(lo, e.maxMin || 120); return from + ((e.warn || 45) + (e.dur || 30)) * 1000 + (lo + Math.random() * (hi - lo)) * 60000; }
async function startEmission(){
  const warn = emiNum('emiWarn', 10, 180, 45), dur = emiNum('emiDur', 10, 180, 30), now = Date.now();
  const e = Object.assign({}, S.emi, {id:G.uid(), start:now, warn, dur, stopped:false});
  if (e.auto) e.nextAt = nextRandom(e, now);
  await DB.set('config/emission', e); radio('Emission! Everyone to shelter.');
}
// Any open page can fire a scheduled random emission; the transaction makes sure only one does.
setInterval(async () => {
  const e = S.emi; if (!S.ready || !e || !e.auto || !e.nextAt || Date.now() < e.nextAt || emiPhase(e, Date.now()) !== 'calm') return;
  try {
    let fired = false;
    await DB.tx(async t => {
      const cur = await t.get('config/emission'); const now = Date.now();
      if (!cur || !cur.auto || !cur.nextAt || now < cur.nextAt || emiPhase(cur, now) !== 'calm') return;
      t.set('config/emission', Object.assign({}, cur, {id:G.uid(), start:now, stopped:false, nextAt:nextRandom(cur, now)})); fired = true;
    });
    if (fired) radio('Emission! Everyone to shelter.');
  } catch (err) { console.error(err); }
}, 5000);
function renderEmiStatus(){
  const e = S.emi, ph = emiPhase(e, Date.now());
  $('emiStatus').textContent = ph === 'warning' ? 'Warning running' : ph === 'blowout' ? 'Blowout!' : 'Calm';
  $('btnEmiStop').hidden = ph === 'calm'; $('btnEmiNow').disabled = ph !== 'calm';
  $('btnEmiAuto').setAttribute('aria-pressed', !!e.auto); $('btnEmiAuto').textContent = 'Random emissions: ' + (e.auto ? 'on' : 'off');
  if (e.auto && e.nextAt){ const m = Math.max(0, Math.round((e.nextAt - Date.now()) / 60000)); $('emiNext').textContent = 'Next one in about ' + m + ' min'; } else $('emiNext').textContent = '';
}
function renderEmiHost(){
  if (!isHost) return;
  const e = S.emi;
  if (document.activeElement !== $('emiWarn') && e.warn) $('emiWarn').value = e.warn;
  if (document.activeElement !== $('emiDur') && e.dur) $('emiDur').value = e.dur;
  if (document.activeElement !== $('emiMin') && e.minMin) $('emiMin').value = e.minMin;
  if (document.activeElement !== $('emiMax') && e.maxMin) $('emiMax').value = e.maxMin;
  renderEmiStatus();
  $('emiCaught').replaceChildren(...roster().filter(([, p]) => p.inv.length).map(([id, p]) => {
    const b = el('button', 'btn', nameOf(p)); b.type = 'button';
    b.addEventListener('click', async () => {
      b.disabled = true; let lost = null;
      try {
        await DB.tx(async t => { const q = await t.get('players/' + id); const inv = (q && q.inv) || []; if (!inv.length) return; const it = inv[Math.floor(Math.random() * inv.length)]; lost = it.a; t.update('players/' + id, {inv:inv.filter(i => i.id !== it.id)}); });
        if (lost){ radio(nameOf(p) + ' was caught in the emission and lost ' + lost + '.'); toast(nameOf(p) + ' lost ' + lost + '.'); }
      } catch (err) { toast('Could not take it. Try again.'); }
      b.disabled = false;
    });
    return b;
  }));
}
$('btnEmiNow').addEventListener('click', () => startEmission().catch(() => toast('Could not start it. Check the connection.')));
$('btnEmiStop').addEventListener('click', () => DB.set('config/emission', Object.assign({}, S.emi, {stopped:true})));
$('btnEmiAuto').addEventListener('click', () => {
  const minMin = emiNum('emiMin', 5, 240, 40), maxMin = Math.max(minMin, emiNum('emiMax', 5, 240, 120));
  const e = Object.assign({warn:emiNum('emiWarn', 10, 180, 45), dur:emiNum('emiDur', 10, 180, 30)}, S.emi, {minMin, maxMin});
  e.auto = !S.emi.auto; e.nextAt = e.auto ? nextRandom(e, Date.now()) : null;
  DB.set('config/emission', e).then(() => toast(e.auto ? 'Random emissions are on.' : 'Random emissions are off.'));
});
['emiMin', 'emiMax', 'emiWarn', 'emiDur'].forEach(id => $(id).addEventListener('change', () => { if (!S.emi.id && !S.emi.auto) return; const minMin = emiNum('emiMin', 5, 240, 40); DB.set('config/emission', Object.assign({}, S.emi, {minMin, maxMin:Math.max(minMin, emiNum('emiMax', 5, 240, 120)), warn:emiNum('emiWarn', 10, 180, 45), dur:emiNum('emiDur', 10, 180, 30)})); }));

/* ---------- background sound: psy-radiation ambience ---------- */
const AMB = {el:null, on:ls.get('zone-sound') !== 'off'};
function ambience(){
  if (!AMB.el){ const au = new Audio('audio/psy-radiation.mp3?v=3'); au.loop = true; au.preload = 'auto'; au.volume = 1; au.setAttribute('playsinline', ''); AMB.el = au; }
  return AMB.el;
}
function playAmbience(){ if (!AMB.on) return; const p = ambience().play(); if (p && p.catch) p.catch(e => console.warn('sound waiting for a tap', e)); }
function renderSound(){ const b = $('soundBtn'); b.setAttribute('aria-pressed', AMB.on); b.textContent = AMB.on ? 'Sound on' : 'Sound off'; }
$('soundBtn').addEventListener('click', () => {
  AMB.on = !AMB.on; ls.set('zone-sound', AMB.on ? 'on' : 'off'); renderSound();
  if (AMB.on) playAmbience(); else if (AMB.el) AMB.el.pause();
});
// Browsers only allow sound after a tap or key press, so every interaction nudges it on.
['pointerdown', 'touchend', 'keydown'].forEach(ev => window.addEventListener(ev, e => {
  if (e.target && e.target.id === 'soundBtn') return;
  if (AMB.on && (!AMB.el || AMB.el.paused)) playAmbience();
}, {passive:true}));
renderSound();

main();
