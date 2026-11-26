import { apiFetch, setStoredToken } from './api.js';

export async function login(usuario, contrasena) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: { usuario, contrasena },
  });
  if (data?.token) setStoredToken(data.token);
  return data.user;
}

export async function getMe() {
  return apiFetch('/api/auth/me');
}

export function logout() {
  setStoredToken(null);
}