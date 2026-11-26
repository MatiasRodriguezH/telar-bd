const TOKEN_KEY = 'lvc_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/**
 * Limpia prefijos técnicos tipo "ORA-20302: LA MESA 1 YA ESTA RESERVADA..."
 * para mostrar mensajes claros en el Toast.
 */
function cleanErrorMessage(raw = '') {
  const firstLine = String(raw).split('\n')[0];
  return firstLine.replace(/^ORA-\d{5}:\s*/i, '').trim() || 'Error al comunicarse con el servidor.';
}

export async function apiFetch(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
    body:
      options.body && typeof options.body !== 'string'
        ? JSON.stringify(options.body)
        : options.body,
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    const err = new Error(cleanErrorMessage(data?.message || `Error HTTP ${response.status}`));
    err.status = response.status;
    throw err;
  }

  return data;
}