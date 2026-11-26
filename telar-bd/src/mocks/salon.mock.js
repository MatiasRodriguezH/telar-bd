export const MESAS_SEED = [
  { num_mesa: 1, capacidad: 2, ubicacion: 'Ventana' },
  { num_mesa: 2, capacidad: 4, ubicacion: 'Salón Principal' },
  { num_mesa: 3, capacidad: 4, ubicacion: 'Salón Principal' },
  { num_mesa: 4, capacidad: 6, ubicacion: 'Terraza' },
  { num_mesa: 5, capacidad: 8, ubicacion: 'Salón VIP' },
  { num_mesa: 6, capacidad: 2, ubicacion: 'Barra' },
];

export const CLIENTES_SEED = [
  {
    rut_cliente: '16789123-3',
    nombres: 'Camila Andrea',
    apellido_paterno: 'Rojas',
    apellido_materno: 'Fuentes',
    correo: 'camila.rojas@correo.cl',
    telefono: '+56 9 8123 4567',
  },
  {
    rut_cliente: '19234567-7',
    nombres: 'Tomás Ignacio',
    apellido_paterno: 'Vega',
    apellido_materno: 'Soto',
    correo: 'tomas.vega@correo.cl',
    telefono: '+56 9 7654 3210',
  },
  {
    rut_cliente: '20123456-5',
    nombres: 'Valentina Paz',
    apellido_paterno: 'Herrera',
    apellido_materno: 'Lagos',
    correo: 'valentina.herrera@correo.cl',
    telefono: '+56 9 9345 6789',
  },
];

export const ACOMPANANTES_SEED = [
  { rut_cliente: '16789123-3', nro_acompanante: 1, nombre: 'Felipe Morales' },
  { rut_cliente: '16789123-3', nro_acompanante: 2, nombre: 'Javiera Rojas' },
  { rut_cliente: '19234567-7', nro_acompanante: 1, nombre: 'Sofía Contreras' },
];

export const RESERVAS_SEED = [
  {
    id_reserva: 1,
    rut_cliente: '16789123-3',
    num_mesa: 2,
    inicio: '2026-11-26T20:00:00',
    fin: '2026-11-26T22:00:00',
    comensales: 3,
  },
  {
    id_reserva: 2,
    rut_cliente: '19234567-7',
    num_mesa: 1,
    inicio: '2026-11-26T21:00:00',
    fin: '2026-11-26T23:00:00',
    comensales: 2,
  },
];