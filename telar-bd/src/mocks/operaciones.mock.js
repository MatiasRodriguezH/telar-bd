export const PEDIDOS_SEED = [
  {
    id_pedido: 1,
    num_mesa: 2,
    rut_empleado: '12345678-5',
    fecha_hora: '2026-11-26T13:30:00',
    propina: 4500,
  },
  {
    id_pedido: 2,
    num_mesa: 4,
    rut_empleado: '12345678-5',
    fecha_hora: '2026-11-26T14:15:00',
    propina: 3500,
  },
];

export const DETALLES_PEDIDO_SEED = [
  { id_pedido: 1, id_plato: 1, cantidad: 1, precio_unitario: 10900 },
  { id_pedido: 1, id_plato: 3, cantidad: 2, precio_unitario: 16900 },
  { id_pedido: 2, id_plato: 4, cantidad: 1, precio_unitario: 18500 },
  { id_pedido: 2, id_plato: 7, cantidad: 2, precio_unitario: 4200 },
  { id_pedido: 2, id_plato: 6, cantidad: 1, precio_unitario: 6500 },
];