// Frontend-only auth with SHA-256
const USERS_KEY = 'users';
const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
const setUsers = (u) => localStorage.setItem(USERS_KEY, JSON.stringify(u));

export async function hashPassword(pw){
  const enc = new TextEncoder().encode(String(pw || ''));
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
export async function registerUser({name,email,password}){
  name = String(name||'').trim();
  email = String(email||'').toLowerCase().trim();
  if(!name || !email || !password) return {ok:false,error:'Missing fields'};
  const users = getUsers();
  if(users.some(u=>u.email===email)) return {ok:false,error:'Email already registered'};
  const hash = await hashPassword(password);
  users.push({ name, email, hash, createdAt: Date.now() });
  setUsers(users); loginMock(email); return {ok:true};
}
export async function login(email,password){
  email = String(email||'').toLowerCase().trim();
  const u = getUsers().find(x=>x.email===email);
  if(!u) return {ok:false,error:'No account found for this email'};
  const hash = await hashPassword(password||'');
  if(hash !== u.hash) return {ok:false,error:'Incorrect password'};
  loginMock(email); return {ok:true};
}
export function currentUser(){
  const email = localStorage.getItem('auth_email'); if(!email) return null;
  return getUsers().find(u=>u.email===email) || { email };
}
export function loginMock(email){
  const token = `jwt.${btoa(email)}.${Date.now()}`;
  localStorage.setItem('auth_token', token); localStorage.setItem('auth_email', email);
}
export function logout(){ localStorage.removeItem('auth_token'); localStorage.removeItem('auth_email'); }
export const isLoggedIn = () => !!localStorage.getItem('auth_token');
export const authEmail  = () => localStorage.getItem('auth_email') || '';
export function requireLogin(onFailRedirect='login.html'){ if(!isLoggedIn()) location.href=onFailRedirect; }

