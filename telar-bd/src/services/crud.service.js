import { apiFetch } from './api.js';

/**
 * recurso: 'clientes' | 'acompanantes' | 'mesas' | 'empleados' | 'turnos'
 *        | 'categorias' | 'platos' | 'ingredientes' | 'proveedores' | 'bodegas'
 */
export function listCrud(recurso) {
  return apiFetch(`/api/crud/${recurso}`);
}

export function createCrud(recurso, payload) {
  return apiFetch(`/api/crud/${recurso}`, {
    method: 'POST',
    body: payload,
  });
}

export function updateCrud(recurso, id, payload) {
  return apiFetch(`/api/crud/${recurso}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deleteCrud(recurso, id) {
  return apiFetch(`/api/crud/${recurso}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}