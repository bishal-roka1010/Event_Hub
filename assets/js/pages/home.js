import { esc, safeFetchJSON } from '../ui.js';
const res = await safeFetchJSON('./data/events.json');
const data = res.__error ? [] : res;
const soon = [...data].sort((a,b)=> a.date.localeCompare(b.date)).slice(0,3);
const grid = document.getElementById('upcoming');
grid.innerHTML = soon.map(e => `
  <div class="col">
    <div class="card h-100 hoverable">
      <img loading="lazy" src="${esc(e.image)}" class="card-img-top" alt="Poster of ${esc(e.title)}">
      <div class="card-body">
        <h5 class="card-title">${esc(e.title)}</h5>
        <p class="card-text">${esc(e.venue)} · ${esc(e.date)}</p>
        <a class="btn btn-sm btn-primary" href="details.html?id=${encodeURIComponent(e.id)}">View</a>
      </div>
    </div>
  </div>`).join('') || '<p class="text-muted">No upcoming events.</p>';
