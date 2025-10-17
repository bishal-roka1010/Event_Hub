import { registerUser } from '../auth.js';
import { debounce } from '../ui.js';

const form = document.getElementById('regForm');
const pass = document.getElementById('pass');
const strength = document.getElementById('strength');
const togglePass = document.getElementById('togglePass');
const errorBox = document.getElementById('formErrors');

togglePass.addEventListener('click', ()=>{
  pass.type = pass.type==='password' ? 'text' : 'password';
  togglePass.innerHTML = pass.type==='password' ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
});

pass.addEventListener('input', ()=>{
  const v = pass.value; let score=0;
  if(/[a-z]/.test(v)) score++; if(/[A-Z]/.test(v)) score++; if(/\d/.test(v)) score++; if(/[^A-Za-z0-9]/.test(v)) score++; if(v.length>=12) score++;
  const pct = Math.min(100, score*20);
  strength.style.width=pct+'%';
  strength.className='progress-bar '+(pct<40?'bg-danger':pct<80?'bg-warning':'bg-success');
});

function showError(msg){
  errorBox.classList.remove('d-none'); errorBox.innerText = msg;
  errorBox.setAttribute('role','alert');
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  errorBox.classList.add('d-none');
  if(!form.checkValidity()){ form.reportValidity(); return; }
  const fd = new FormData(form);
  if(fd.get('pass') !== fd.get('confirm')){ showError('Passwords do not match'); return; }
  if(!document.getElementById('agree').checked){ showError('Please agree to the terms'); return; }
  const res = await registerUser({ name: fd.get('name'), email: fd.get('email'), password: fd.get('pass') });
  if(!res.ok){ showError(res.error); return; }
  document.getElementById('msg').classList.remove('d-none');
  setTimeout(()=> location.href='index.html', 800);
});
