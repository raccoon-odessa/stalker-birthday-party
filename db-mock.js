// In-browser stand-in for Firestore (open the site with ?mock to use it).
// Data lives in localStorage and syncs between tabs of the same browser.
const KEY = 'zone-mockdb';
const chan = 'BroadcastChannel' in self ? new BroadcastChannel('zone-mockdb') : null;
const subs = new Set();
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } };
let store = load();
const clone = v => v == null ? null : JSON.parse(JSON.stringify(v));
function commit(){ localStorage.setItem(KEY, JSON.stringify(store)); if (chan) chan.postMessage(1); notify(); }
function notify(){ subs.forEach(s => setTimeout(s, 0)); }
if (chan) chan.onmessage = () => { store = load(); notify(); };

export async function get(p){ store = load(); return clone(store[p]); }
export async function set(p, d){ store = load(); store[p] = clone(d); commit(); }
export async function update(p, d){ store = load(); if (!store[p]) throw new Error('No document ' + p); Object.assign(store[p], clone(d)); commit(); }
export async function remove(p){ store = load(); delete store[p]; commit(); }
export const newId = () => Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
export async function add(c, d){ store = load(); const id = newId(); store[c + '/' + id] = clone(d); commit(); return id; }
export function watchDoc(p, cb){ const run = () => cb(clone(store[p])); subs.add(run); run(); return () => subs.delete(run); }
export function watchCol(c, opts, cb){
  const run = () => {
    let rows = Object.keys(store).filter(k => k.startsWith(c + '/') && k.split('/').length === 2).map(k => Object.assign({id:k.split('/')[1]}, clone(store[k])));
    if (opts.where){ const [f, op, v] = opts.where; rows = rows.filter(r => op === 'array-contains' ? (r[f] || []).includes(v) : r[f] === v); }
    if (opts.orderBy){ const [f, dir] = opts.orderBy; rows.sort((a, b) => (a[f] > b[f] ? 1 : -1) * (dir === 'desc' ? -1 : 1)); }
    if (opts.limit) rows = rows.slice(0, opts.limit);
    cb(rows);
  };
  subs.add(run); run(); return () => subs.delete(run);
}
export async function tx(fn){
  store = load();
  const writes = [];
  const out = await fn({ get: async p => clone(store[p]), set: (p, d) => writes.push(['s', p, d]), update: (p, d) => writes.push(['u', p, d]) });
  writes.forEach(([k, p, d]) => { if (k === 's') store[p] = clone(d); else Object.assign(store[p], clone(d)); });
  commit();
  return out;
}
