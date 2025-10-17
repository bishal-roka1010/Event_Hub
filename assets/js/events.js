// RSVP store
const KEY='rsvps';
const all=()=>JSON.parse(localStorage.getItem(KEY)||'[]');
const save=(list)=>localStorage.setItem(KEY, JSON.stringify(list));
export function addRsvp(eventId,email){
  const r=all(); if(r.some(x=>x.eventId===eventId && x.email===email)) return false;
  r.push({eventId,email,at:Date.now()}); save(r); return true;
}
export function removeRsvp(eventId,email){ save(all().filter(x=>!(x.eventId===eventId && x.email===email))); }
export function myRsvps(email){ return all().filter(x=>x.email===email).map(x=>x.eventId); }

// Favorites
const FAV='favs';
const favAll=()=> JSON.parse(localStorage.getItem(FAV)||'[]');
const favSave=(v)=> localStorage.setItem(FAV, JSON.stringify(v));
export function toggleFav(id){
  const f=favAll(); const i=f.indexOf(id);
  if(i>=0){ f.splice(i,1); favSave(f); return false; } else { f.push(id); favSave(f); return true; }
}
export function isFav(id){ return favAll().includes(id); }
export function allFav(){ return favAll(); }
