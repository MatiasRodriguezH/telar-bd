import { apiFetch, setStoredToken } from './api.js';

// Envía RUT y contraseña al backend para iniciar sesión y guarda el token recibido
export async function login(rut_empleado, contrasena) {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: { rut_empleado, contrasena },
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