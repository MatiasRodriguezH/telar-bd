import { apiFetch } from './api.js';

// Reporte 01: Ranking de platos vendidos y recaudación (BCMRACUF_REP_VENTAS_PLATO)
export function getReporteVentasPlato() {
  return apiFetch('/api/reportes/ventas-plato');
}

// Reporte 02: Desempeño, turnos y propinas de garzones (BCMRACUF_REP_GARZONES)
export function getReporteGarzones() {
  return apiFetch('/api/reportes/garzones');
}

// Reporte 03: Estado del inventario y alertas de stock (BCMRACUF_REP_INVENTARIO)
export function getReporteInventario() {
  return apiFetch('/api/reportes/inventario');
}
