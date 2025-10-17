import { esc, toast, safeFetchJSON, fmtDate } from '../ui.js';
import { isLoggedIn, authEmail } from '../auth.js';
import { addRsvp } from '../events.js';

const params = new URLSearchParams(location.search);
const id = params.get('id');
const content = document.getElementById('content');

const res = await safeFetchJSON('./data/events.json');
const events = res.__error ? [] : res;
const e = events.find(x=>x.id===id);
if(!e){ content.innerHTML='<p class="text-danger">Event not found.</p>'; }
else {
  content.innerHTML = `
    <div class="col-md-6"><img loading="lazy" src="${esc(e.image)}" class="img-fluid rounded" alt="Poster of ${esc(e.title)}"></div>
    <div class="col-md-6">
      <h1 class="h3 mb-1">${esc(e.title)}</h1>
      <p class="text-muted mb-2">${esc(e.venue)} — ${esc(e.location)} — ${fmtDate(e.date, e.time)}</p>
      <p>${esc(e.description)}</p>
      <div class="ratio ratio-16x9 mb-3">
        <iframe loading="lazy" src="https://maps.google.com/maps?q=${e.lat},${e.lng}&z=15&output=embed" title="Map"></iframe>
      </div>
      <div class="d-flex gap-2 flex-wrap">
        <button id="rsvp" class="btn btn-primary">Register / RSVP</button>
        <button id="addCal" class="btn btn-outline-secondary">Add to Calendar</button>
        <button id="share" class="btn btn-outline-secondary">Share</button>
        <button id="copyLink" class="btn btn-outline-secondary">Copy link</button>
        <a href="event.html" class="btn btn-outline-primary">Back to events</a>
      </div>
      <p class="mt-3 text-muted small" id="attCount"></p>
    </div>`;
  document.getElementById('rsvp').addEventListener('click', ()=>{
    if(!isLoggedIn()){ location.href='login.html'; return; }
    const ok = addRsvp(e.id, authEmail());
    toast(ok ? 'Registered successfully!' : 'You are already registered for this event.');
    updateCount();
  });
  document.getElementById('copyLink').addEventListener('click', ()=> {
    navigator.clipboard.writeText(location.href).then(()=> toast('Link copied'));
  });
  document.getElementById('share').addEventListener('click', async ()=>{
    if(navigator.share){
      try{ await navigator.share({ title:e.title, text:e.description, url:location.href }); } catch{}
    } else {
      navigator.clipboard.writeText(location.href).then(()=> toast('Link copied'));
    }
  });
  document.getElementById('addCal').addEventListener('click', ()=>{
    const dt = `${e.date.replace(/-/g,'')}T${(e.time||'09:00').replace(':','')}00`;
    const uid = `eventhub-${e.id}-${Date.now()}@local`;
    const body = [
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//EventHub//EN',
      'BEGIN:VEVENT',`UID:${uid}`,`DTSTAMP:${dt}Z`,`DTSTART:${dt}Z`,`DTEND:${dt}Z`,
      `SUMMARY:${e.title}`,`LOCATION:${e.venue}, ${e.location||''}`,
      `DESCRIPTION:${e.description||''}`,'END:VEVENT','END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([body],{type:'text/calendar'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${e.title}.ics`; a.click();
  });
  function updateCount(){
    const all = JSON.parse(localStorage.getItem('rsvps') || '[]');
    const n = all.filter(x => x.eventId===e.id).length;
    document.getElementById('attCount').textContent = n ? `${n} attendee(s) registered (demo data)` : 'Be the first to register!';
  }
  updateCount();
}
