import { apiFetch } from './api.js';

// --- GESTOR 01: RESERVAS ---

// Obtiene todas las reservas registradas en Oracle (BCMRACUF_SEL_RESERVAS)
export function getReservas() {
  return apiFetch('/api/gestores/reservas');
}

// Crea una reserva y opcionalmente un acompañante (BCMRACUF_GESTOR_RESERVA)
export function crearReserva(datos) {
  return apiFetch('/api/gestores/reservas', {
    method: 'POST',
    body: datos,
  });
}

// Elimina o cancela una reserva por su ID
export function eliminarReserva(idReserva) {
  return apiFetch(`/api/gestores/reservas/${idReserva}`, {
    method: 'DELETE',
  });
}

// --- GESTOR 02: ASIGNACION DE TURNOS ---

// Lista los turnos asignados a empleados (BCMRACUF_SEL_ASIGNACIONES)
export function getAsignacionesTurno() {
  return apiFetch('/api/gestores/turnos');
}

// Asigna un turno a un empleado en una fecha (BCMRACUF_GESTOR_TURNO)
export function asignarTurno(datos) {
  return apiFetch('/api/gestores/turnos', {
    method: 'POST',
    body: datos,
  });
}

// --- GESTOR 03: PEDIDOS Y DETALLES ---

// Lista todos los pedidos con su total y propina (BCMRACUF_SEL_PEDIDOS)
export function getPedidos() {
  return apiFetch('/api/gestores/pedidos');
}

// Obtiene los platos que pertenecen a un pedido específico
export function getDetallePedido(idPedido) {
  return apiFetch(`/api/gestores/pedidos/${idPedido}/detalle`);
}

// Abre la cabecera de un nuevo pedido para una mesa (BCMRACUF_GESTOR_PEDIDO)
export function crearPedido(datos) {
  return apiFetch('/api/gestores/pedidos', {
    method: 'POST',
    body: datos,
  });
}

// Agrega un plato y cantidad a un pedido existente (BCMRACUF_GESTOR_DET_PEDIDO)
export function agregarDetallePedido(idPedido, datos) {
  return apiFetch(`/api/gestores/pedidos/${idPedido}/detalle`, {
    method: 'POST',
    body: datos,
  });
}

// Elimina un pedido junto con su detalle
export function eliminarPedido(idPedido) {
  return apiFetch(`/api/gestores/pedidos/${idPedido}`, {
    method: 'DELETE',
  });
}

// --- GESTOR 04: RECETAS ---

// Lista las recetas (plato + ingrediente + cantidad por porción)
export function getRecetas() {
  return apiFetch('/api/gestores/recetas');
}

// Inserta o actualiza un ingrediente dentro de la receta de un plato
export function guardarReceta(datos) {
  return apiFetch('/api/gestores/recetas', {
    method: 'POST',
    body: datos,
  });
}

// --- GESTOR 05: SUMINISTROS ---

// Lista el historial de suministros ingresados a bodega
export function getSuministros() {
  return apiFetch('/api/gestores/suministros');
}

// Registra un nuevo suministro y sube el stock del ingrediente en Oracle
export function registrarSuministro(datos) {
  return apiFetch('/api/gestores/suministros', {
    method: 'POST',
    body: datos,
  });
}
