export const esc = (s='') => String(s).replace(/[&<>"']/g, m=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[m]) );

export function initThemeToggle(){
  const btn = document.getElementById('themeToggle');
  if(!btn) return;
  const pref = localStorage.getItem('theme') || 'light';
  if(pref==='dark') document.body.classList.add('dark');
  btn.addEventListener('click', ()=>{
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark')?'dark':'light');
  });
}


// Toast pinned at the bottom center, always above header/iframes
export function toast(msg){
  // live region for screen readers
  let live = document.getElementById('live');
  if(!live){
    live = document.createElement('div');
    live.id = 'live';
    live.className = 'visually-hidden';
    live.setAttribute('aria-live','polite');
    document.body.appendChild(live);
  }
  live.textContent = msg;

  // Reuse or create a fixed container
  let container = document.getElementById('toastContainer');
  if(!container){
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container p-3';
    document.body.appendChild(container);
  }

  // Bottom-center and very high z-index
  Object.assign(container.style, {
    position: 'fixed',
    left: '50%',
    bottom: '16px',
    transform: 'translateX(-50%)',
    zIndex: '9999',           // higher than sticky header/map
    pointerEvents: 'none'     // container doesn't block clicks
  });

  const el = document.createElement('div');
  el.className = 'toast align-items-center text-bg-primary border-0 shadow';
  el.setAttribute('role','status');
  el.style.pointerEvents = 'auto'; // toast itself is clickable
  el.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${msg}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;

  container.appendChild(el);
  const t = new bootstrap.Toast(el, { delay: 1600 });
  t.show();
  el.addEventListener('hidden.bs.toast', () => el.remove());
}


// scroll-to-top
(function(){
  const btn = document.createElement('button');
  btn.className='scroll-top btn btn-primary rounded-circle shadow'; btn.title='Back to top'; btn.innerHTML='↑';
  btn.addEventListener('click', ()=>window.scrollTo({top:0,behavior:'smooth'}));
  document.addEventListener('DOMContentLoaded', ()=> document.body.appendChild(btn));
  let last=0; window.addEventListener('scroll', ()=>{
    const now=Date.now(); if(now-last<100) return; last=now;
    if(window.scrollY>240) btn.classList.add('show'); else btn.classList.remove('show');
  }, {passive:true});
})();

// Pretty date formatting
export function fmtDate(d, t){
  const dt = new Date(`${d}T${t||'09:00'}`);
  if(Number.isNaN(dt.getTime())) return `${d} ${t||''}`;
  return dt.toLocaleString([], { weekday:'short', day:'2-digit', month:'short', year:'numeric', hour:'numeric', minute:'2-digit' });
}

// Debounce helper
export function debounce(fn, wait=200){
  let to; return (...args)=>{ clearTimeout(to); to=setTimeout(()=>fn.apply(null,args), wait); };
}

// Safe fetch with retry
export async function safeFetchJSON(url, retries=1){
  try{
    const r = await fetch(url);
    if(!r.ok) throw new Error(r.status);
    return await r.json();
  }catch(e){
    if(retries>0) return await safeFetchJSON(url, retries-1);
    return { __error: true, message: String(e) };
  }
}
