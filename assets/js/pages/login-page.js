import { isLoggedIn, login } from '../auth.js';
const form = document.getElementById('loginForm');
const pass = document.getElementById('pass');
const togglePass = document.getElementById('togglePass');
const errorBox = document.getElementById('formErrors');
if (isLoggedIn()) location.href='index.html';

togglePass.addEventListener('click', ()=>{
  pass.type = pass.type==='password' ? 'text' : 'password';
  togglePass.innerHTML = pass.type==='password' ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
});
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  errorBox.classList.add('d-none');
  if(!form.checkValidity()) { form.reportValidity(); return; }
  const email = document.getElementById('email').value.trim().toLowerCase();
  const pwd = pass.value;
  const res = await login(email, pwd);
  if(!res.ok){ errorBox.classList.remove('d-none'); errorBox.innerText = res.error || 'Login failed'; return; }
  document.getElementById('msg').classList.remove('d-none');
  setTimeout(()=> location.href='index.html', 600);
});
