import { isLoggedIn, authEmail } from '../auth.js';
import { myRsvps, removeRsvp } from '../events.js';
import { esc } from '../ui.js';
if(!isLoggedIn()) location.href='login.html';

let events=[];
try{ const r = await fetch('./data/events.json'); events = r.ok ? await r.json() : []; }catch{ events=[]; }

const grid = document.getElementById('registered');
const exportBtn = document.getElementById('exportJson');
const printBtn = document.getElementById('printBtn');
const search = document.getElementById('searchDash');

exportBtn.addEventListener('click', ()=>{
  const data = localStorage.getItem('rsvps') || '[]';
  const blob = new Blob([data], {type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='my-registrations.json'; a.click();
});
printBtn.addEventListener('click', ()=> window.print());
search.addEventListener('input', ()=> render());

function render(){
  const mineIds = new Set(myRsvps(authEmail()));
  const term = search.value.trim().toLowerCase();
  const mine = events.filter(e => mineIds.has(e.id) && (!term || e.title.toLowerCase().includes(term)));
  grid.innerHTML = mine.map(e=>`
    <div class="col">
      <div class="card h-100 hoverable">
        <img loading="lazy" src="${esc(e.image)}" class="card-img-top" alt="Poster of ${esc(e.title)}">
        <div class="card-body">
          <h5 class="card-title">${esc(e.title)}</h5>
          <p class="card-text">${esc(e.venue)} · ${esc(e.date)}</p>
          <div class="d-flex gap-2">
            <a class="btn btn-sm btn-outline-primary" href="details.html?id=${encodeURIComponent(e.id)}">View</a>
            <button class="btn btn-sm btn-outline-danger" data-id="${e.id}">Cancel</button>
          </div>
        </div>
      </div>
    </div>`).join('') || `
      <div class="text-center text-muted p-5">
        <i class="bi bi-emoji-smile fs-1"></i>
        <p class="mt-2">No registrations yet. Browse events and RSVP to see them here.</p>
        <a href="event.html" class="btn btn-primary btn-sm">Find events</a>
      </div>`;
  grid.querySelectorAll('button[data-id]').forEach(btn=> btn.addEventListener('click', ()=>{
    removeRsvp(btn.dataset.id, authEmail()); render();
  }));
}
render();
