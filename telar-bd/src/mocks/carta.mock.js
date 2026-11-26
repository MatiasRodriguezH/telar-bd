export const CATEGORIAS_SEED = [
  { id_categoria: 1, nombre: 'Entradas' },
  { id_categoria: 2, nombre: 'Platos de Fondo' },
  { id_categoria: 3, nombre: 'Postres' },
  { id_categoria: 4, nombre: 'Bebestibles' },
];

export const PLATOS_SEED = [
  { id_plato: 1, id_categoria: 1, nombre: 'Ceviche de Reineta', precio_vigente: 10900 },
  { id_plato: 2, id_categoria: 1, nombre: 'Empanadas de Queso Camarón (3 u.)', precio_vigente: 8500 },
  { id_plato: 3, id_categoria: 2, nombre: 'Lomo Saltado a lo Pobre', precio_vigente: 16900 },
  { id_plato: 4, id_categoria: 2, nombre: 'Salmón a la Plancha con Puré Rústico', precio_vigente: 18500 },
  { id_plato: 5, id_categoria: 2, nombre: 'Risotto de Hongos y Parmesano', precio_vigente: 14900 },
  { id_plato: 6, id_categoria: 3, nombre: 'Tiramisú Artesanal', precio_vigente: 6500 },
  { id_plato: 7, id_categoria: 4, nombre: 'Limonada Menta Jengibre', precio_vigente: 4200 },
  { id_plato: 8, id_categoria: 4, nombre: 'Pisco Sour Catedral', precio_vigente: 7900 },
];

export const INGREDIENTES_SEED = [
  { id_ingrediente: 1, nombre: 'Filete de Reineta', unidad_base: 'kg', stock_actual: 8.5 },
  { id_ingrediente: 2, nombre: 'Limón de Pica', unidad_base: 'kg', stock_actual: 12 },
  { id_ingrediente: 3, nombre: 'Camarón Ecuatoriano', unidad_base: 'kg', stock_actual: 5 },
  { id_ingrediente: 4, nombre: 'Lomo Vetado', unidad_base: 'kg', stock_actual: 14 },
  { id_ingrediente: 5, nombre: 'Papas', unidad_base: 'kg', stock_actual: 30 },
  { id_ingrediente: 6, nombre: 'Filete de Salmón', unidad_base: 'kg', stock_actual: 7 },
  { id_ingrediente: 7, nombre: 'Arroz Arborio', unidad_base: 'kg', stock_actual: 9 },
  { id_ingrediente: 8, nombre: 'Queso Mascarpone', unidad_base: 'kg', stock_actual: 3.5 },
  { id_ingrediente: 9, nombre: 'Pisco Reservado 40°', unidad_base: 'L', stock_actual: 6 },
  { id_ingrediente: 10, nombre: 'Cebolla Morada', unidad_base: 'kg', stock_actual: 10 },
];

export const RECETAS_SEED = [
  // Ceviche de Reineta
  { id_plato: 1, id_ingrediente: 1, cantidad_por_porcion: 0.22 },
  { id_plato: 1, id_ingrediente: 2, cantidad_por_porcion: 0.15 },
  { id_plato: 1, id_ingrediente: 10, cantidad_por_porcion: 0.08 },
  // Empanadas Queso Camarón
  { id_plato: 2, id_ingrediente: 3, cantidad_por_porcion: 0.15 },
  // Lomo Saltado a lo Pobre
  { id_plato: 3, id_ingrediente: 4, cantidad_por_porcion: 0.25 },
  { id_plato: 3, id_ingrediente: 5, cantidad_por_porcion: 0.3 },
  { id_plato: 3, id_ingrediente: 10, cantidad_por_porcion: 0.1 },
  // Salmón a la Plancha
  { id_plato: 4, id_ingrediente: 6, cantidad_por_porcion: 0.24 },
  { id_plato: 4, id_ingrediente: 5, cantidad_por_porcion: 0.25 },
  // Risotto de Hongos
  { id_plato: 5, id_ingrediente: 7, cantidad_por_porcion: 0.18 },
  // Tiramisú Artesanal
  { id_plato: 6, id_ingrediente: 8, cantidad_por_porcion: 0.12 },
  // Limonada Menta Jengibre
  { id_plato: 7, id_ingrediente: 2, cantidad_por_porcion: 0.12 },
  // Pisco Sour Catedral
  { id_plato: 8, id_ingrediente: 9, cantidad_por_porcion: 0.12 },
  { id_plato: 8, id_ingrediente: 2, cantidad_por_porcion: 0.1 },
];