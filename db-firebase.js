// Firestore adapter. db-mock.js exposes the same functions for local testing.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, collection, onSnapshot, query, where, orderBy, limit, runTransaction } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { FIREBASE } from './config.js?v=4';

const db = getFirestore(initializeApp(FIREBASE));
const ref = p => doc(db, ...p.split('/'));

export async function get(p){ const s = await getDoc(ref(p)); return s.exists() ? s.data() : null; }
export const set = (p, d) => setDoc(ref(p), d);
export const update = (p, d) => updateDoc(ref(p), d);
export const remove = p => deleteDoc(ref(p));
export async function add(c, d){ const r = await addDoc(collection(db, c), d); return r.id; }
export const newId = () => doc(collection(db, 'ids')).id;
export function watchDoc(p, cb, onErr){ return onSnapshot(ref(p), s => cb(s.exists() ? s.data() : null), e => { console.error(e); onErr && onErr(e); }); }
export function watchCol(c, opts, cb, onErr){
  const parts = [];
  if (opts.where) parts.push(where(...opts.where));
  if (opts.orderBy) parts.push(orderBy(opts.orderBy[0], opts.orderBy[1] || 'asc'));
  if (opts.limit) parts.push(limit(opts.limit));
  return onSnapshot(query(collection(db, c), ...parts), s => cb(s.docs.map(d => Object.assign({id:d.id}, d.data()))), e => { console.error(e); onErr && onErr(e); });
}
export function tx(fn){
  return runTransaction(db, t => fn({
    get: async p => { const s = await t.get(ref(p)); return s.exists() ? s.data() : null; },
    set: (p, d) => t.set(ref(p), d),
    update: (p, d) => t.update(ref(p), d)
  }));
}
