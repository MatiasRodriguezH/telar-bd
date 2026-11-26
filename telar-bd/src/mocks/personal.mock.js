export const EMPLEADOS_SEED = [
  {
    rut_empleado: '11111111-1',
    nombres: 'Matías',
    apellido_paterno: 'Araya',
    apellido_materno: 'Silva',
    cargo: 'ADMIN',
    sueldo: 1650000,
    telefono: '+56 9 9000 1111',
    usuario: 'admin',
    contrasena: 'admin123',
  },
  {
    rut_empleado: '12345678-5',
    nombres: 'Diego',
    apellido_paterno: 'Mendoza',
    apellido_materno: 'Paredes',
    cargo: 'GARZON',
    sueldo: 720000,
    telefono: '+56 9 9000 2222',
    usuario: 'garzon',
    contrasena: '1234',
  },
  {
    rut_empleado: '15432198-5',
    nombres: 'Francisca',
    apellido_paterno: 'Castro',
    apellido_materno: 'León',
    cargo: 'CHEF',
    sueldo: 1250000,
    telefono: '+56 9 9000 3333',
    usuario: 'chef',
    contrasena: '1234',
  },
  {
    rut_empleado: '18765432-7',
    nombres: 'Paula',
    apellido_paterno: 'Núñez',
    apellido_materno: 'Reyes',
    cargo: 'RECEPCIONISTA',
    sueldo: 680000,
    telefono: '+56 9 9000 4444',
    usuario: 'recepcion',
    contrasena: '1234',
  },
];

// inicio_min y fin_min son minutos desde las 00:00 (ej: 540 = 09:00, 960 = 16:00)
export const TURNOS_SEED = [
  { id_turno: 1, inicio_min: 540, fin_min: 960 },   // 09:00 - 16:00 (Almuerzo)
  { id_turno: 2, inicio_min: 960, fin_min: 1410 },  // 16:00 - 23:30 (Cena)
];

export const ASIGNACIONES_TURNO_SEED = [
  { rut_empleado: '11111111-1', id_turno: 1, fecha: '2026-11-26' },
  { rut_empleado: '15432198-5', id_turno: 1, fecha: '2026-11-26' },
  { rut_empleado: '12345678-5', id_turno: 2, fecha: '2026-11-26' },
  { rut_empleado: '18765432-7', id_turno: 2, fecha: '2026-11-26' },
];