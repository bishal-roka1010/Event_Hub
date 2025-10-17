import { esc, debounce, safeFetchJSON, fmtDate } from '../ui.js';
import { toggleFav, isFav, allFav } from '../events.js';

let events=[]; let current=1, perPage=6;
const grid = document.getElementById('grid');
const q = document.getElementById('q'), sort=document.getElementById('sort');
const dateFrom=document.getElementById('dateFrom'), dateTo=document.getElementById('dateTo');
const prev=document.getElementById('prev'), next=document.getElementById('next'), page=document.getElementById('page');
const favOnly = document.getElementById('favOnly');
const chips = document.getElementById('chips');

// build chips (multi-category)
const categories = ['Meetup','Festival','Workshop','Concert'];
chips.innerHTML = categories.map(c=>`<button class="chip" data-cat="${c}" type="button">${c}</button>`).join('');
const activeCats = new Set();
chips.querySelectorAll('.chip').forEach(ch=> ch.addEventListener('click', ()=>{
  const c = ch.dataset.cat;
  if(activeCats.has(c)){ activeCats.delete(c); ch.classList.remove('active'); }
  else { activeCats.add(c); ch.classList.add('active'); }
  current=1; render();
}));

grid.innerHTML = Array.from({length:6}).map(()=>`
  <div class="col"><div class="card h-100 hoverable">
    <div class="skel h150"></div>
    <div class="card-body"><div class="skel h20 mb-2"></div><div class="skel h20" style="width:60%"></div></div>
  </div></div>`).join('');

const res = await safeFetchJSON('./data/events.json');
events = res.__error ? [] : res;
render();

[q,sort,dateFrom,dateTo,favOnly].forEach(el=> el.addEventListener('input', debounce(()=>{current=1;render();}, 200)));
prev.addEventListener('click', ()=> { if(current>1){current--;render();} });
next.addEventListener('click', ()=> { if(current<maxPage()){current++;render();} });

function maxPage(){ return Math.max(1, Math.ceil(filtered().length / perPage)); }
function filtered(){
  const term=q.value.trim().toLowerCase();
  const from=dateFrom.value||null, to=dateTo.value||null;
  const favs = new Set(allFav());
  let arr=[...events];
  arr.sort((a,b)=> sort.value==='title' ? a.title.localeCompare(b.title) : a.date.localeCompare(b.date));
  return arr.filter(e => 
    (!term || e.title.toLowerCase().includes(term) || e.venue.toLowerCase().includes(term)) &&
    (activeCats.size===0 || activeCats.has(e.category)) &&
    (!from || e.date>=from) && (!to || e.date<=to) &&
    (!favOnly.checked || favs.has(e.id))
  );
}
function render(){
  const list=filtered(); const start=(current-1)*perPage, end=start+perPage;
  const pageItems=list.slice(start,end);
  grid.innerHTML = pageItems.map(e=>{
    const favClass = isFav(e.id) ? 'active' : '';
    return `
    <div class="col">
      <div class="card h-100 hoverable">
        <div class="position-relative">
          <img loading="lazy" src="${esc(e.image)}" class="card-img-top" alt="Poster of ${esc(e.title)}">
          <button class="btn btn-light position-absolute top-0 end-0 m-2 heart ${favClass}" data-id="${e.id}" aria-label="Toggle favorite">♥</button>
        </div>
        <div class="card-body">
          <h5 class="card-title">${esc(e.title)}</h5>
          <p class="card-text">${esc(e.venue)} · ${fmtDate(e.date, e.time)} • <span class="badge bg-secondary">${esc(e.category)}</span></p>
          <a class="btn btn-sm btn-primary" href="details.html?id=${encodeURIComponent(e.id)}">View</a>
        </div>
      </div>
    </div>`;
  }).join('') || '<p class="text-muted mt-3">No events match your filters.</p>';
  prev.disabled=(current<=1); next.disabled=(current>=maxPage());
  page.textContent=`Page ${current} / ${maxPage()}`;
  grid.querySelectorAll('.heart').forEach(btn=> btn.addEventListener('click', ()=>{
    const active = toggleFav(btn.dataset.id);
    btn.classList.toggle('active', active);
    if(favOnly.checked) render();
  }));
}
