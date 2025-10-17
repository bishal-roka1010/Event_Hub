import { esc } from '../ui.js';
const search = document.getElementById('admSearch');
const tb = document.getElementById('admintable');
let events=[];
try{ const r = await fetch('./data/events.json'); events = r.ok ? await r.json() : []; }catch{ events=[]; }
search.addEventListener('input', ()=> render());

function render(){
  const term = search.value.trim().toLowerCase();
  const f = !term ? events : events.filter(e => e.title.toLowerCase().includes(term) || e.venue.toLowerCase().includes(term));
  tb.innerHTML = f.map(e=>`
    <tr>
      <td>${esc(e.title)}</td>
      <td>${esc(e.date)} ${esc(e.time)}</td>
      <td>${esc(e.venue)}</td>
      <td><span class="badge bg-secondary">${esc(e.category)}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-secondary" disabled>Update</button>
        <button class="btn btn-sm btn-outline-danger" disabled>Delete</button>
      </td>
    </tr>`).join('');
}
render();
