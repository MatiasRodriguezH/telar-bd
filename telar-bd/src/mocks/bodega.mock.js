export const PROVEEDORES_SEED = [
  { rut_proveedor: '76123456-0', razon_social: 'Distribuidora del Mar SpA', telefono: '+56 2 2456 7890' },
  { rut_proveedor: '76543210-3', razon_social: 'Carnes del Sur Ltda.', telefono: '+56 2 2345 6781' },
  { rut_proveedor: '77889900-0', razon_social: 'Agrícola Valle Central S.A.', telefono: '+56 2 2789 1234' },
];

export const BODEGAS_SEED = [
  { id_bodega: 1, sector: 'Cámara Fría Pescados y Carnes', capacidad: 500, unidad_capacidad: 'kg' },
  { id_bodega: 2, sector: 'Despensa Seca y Verduras', capacidad: 800, unidad_capacidad: 'kg' },
  { id_bodega: 3, sector: 'Bodega de Licores y Bebidas', capacidad: 300, unidad_capacidad: 'L' },
];

export const SUMINISTROS_SEED = [
  {
    id_suministro: 1,
    rut_proveedor: '76123456-0',
    id_ingrediente: 1,
    id_bodega: 1,
    fecha_hora: '2026-11-25T08:30:00',
    cantidad: 10,
  },
  {
    id_suministro: 2,
    rut_proveedor: '76543210-3',
    id_ingrediente: 4,
    id_bodega: 1,
    fecha_hora: '2026-11-25T09:15:00',
    cantidad: 15,
  },
  {
    id_suministro: 3,
    rut_proveedor: '77889900-0',
    id_ingrediente: 5,
    id_bodega: 2,
    fecha_hora: '2026-11-25T10:00:00',
    cantidad: 35,
  },
];