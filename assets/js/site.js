import { isLoggedIn, logout } from './auth.js';
import { initThemeToggle } from './ui.js';

initThemeToggle();

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
if (isLoggedIn()) { loginBtn?.classList.add('d-none'); logoutBtn?.classList.remove('d-none'); }
logoutBtn?.addEventListener('click', () => { logout(); location.reload(); });
