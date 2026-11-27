// Lista de cargos autorizados para entrar a cada sección de la aplicación
export const ROLES_POR_SECCION = {
  reservas: ['ADMINISTRADOR', 'ENCARGADO', 'GARZON'],
  pedidos: ['ADMINISTRADOR', 'ENCARGADO', 'GARZON'],
  inventario: ['ADMINISTRADOR', 'ENCARGADO', 'BODEGUERO'],
  empleados: ['ADMINISTRADOR', 'ENCARGADO'],
  misTurnos: ['GARZON'],
};

// Devuelve true si el cargo del empleado puede ver/usar esa sección
export function puedeVerSeccion(cargo, seccion) {
  const permitidos = ROLES_POR_SECCION[seccion] || [];
  return permitidos.includes(String(cargo || '').toUpperCase());
}

// Devuelve true si el cargo puede borrar registros en esa sección (ENCARGADO nunca puede borrar)
export function puedeBorrar(cargo, seccion) {
  const rol = String(cargo || '').toUpperCase();
  if (rol === 'ADMINISTRADOR') return true;
  if (rol === 'ENCARGADO') return false;
  if (rol === 'GARZON') return seccion === 'reservas' || seccion === 'pedidos';
  if (rol === 'BODEGUERO') return seccion === 'inventario';
  return false;
}

// Indica a qué pantalla llevar al empleado apenas inicia sesión según su cargo
export function getRutaInicial(cargo) {
  if (String(cargo || '').toUpperCase() === 'BODEGUERO') return '/inventario';
  return '/reservas';
}
