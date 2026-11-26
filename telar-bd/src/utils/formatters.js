export function formatCLP(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Normaliza un RUT para guardarlo limpio (ej: "12345678-9", máx 10 chars,
 * siempre cabe holgado en VARCHAR2(12) del diagrama).
 */
export function normalizeRut(rut = '') {
  const clean = String(rut).replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return clean;
  return `${clean.slice(0, -1)}-${clean.slice(-1)}`;
}

/**
 * Formatea un RUT para mostrarlo en pantalla (ej: "12.345.678-9").
 */
export function formatRut(rut = '') {
  const clean = String(rut).replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedBody}-${dv}`;
}

/**
 * Convierte TURNO.inicio_min / fin_min (ej: 540) a "09:00".
 */
export function formatMinutosAHora(minutos) {
  const total = Number(minutos || 0);
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Convierte un input type="time" ("09:30") a minutos (570) para TURNO.
 */
export function horaAMinutos(hhmm = '00:00') {
  const [hh, mm] = String(hhmm).split(':').map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return 0;
  return hh * 60 + mm;
}

export function formatFecha(isoString) {
  if (!isoString) return '—';
  // Evita desfases de zona horaria cuando viene solo YYYY-MM-DD
  const date = isoString.length === 10 ? new Date(`${isoString}T12:00:00`) : new Date(isoString);
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatFechaHora(isoString) {
  if (!isoString) return '—';
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(isoString));
}

/**
 * Sirve tanto para EMPLEADO como para CLIENTE (ambos tienen las mismas 3 columnas).
 */
export function formatNombreCompleto(persona) {
  if (!persona) return '';
  return [persona.nombres, persona.apellido_paterno, persona.apellido_materno]
    .filter(Boolean)
    .join(' ');
}
export const CARGO_CONFIG = {
  ADMINISTRADOR: { label: 'Administrador', variant: 'primary' },
  GARZON: { label: 'Garzón', variant: 'info' },
  BODEGUERO: { label: 'Bodeguero', variant: 'warning' },
  COCINERO: { label: 'Cocinero', variant: 'success' },
};

export const ESTADO_STOCK_CONFIG = {
  'SIN STOCK': { label: 'Sin stock', variant: 'danger' },
  'STOCK CRITICO': { label: 'Stock crítico', variant: 'danger' },
  'STOCK BAJO': { label: 'Stock bajo', variant: 'warning' },
  'STOCK OPTIMO': { label: 'Stock óptimo', variant: 'success' },
};