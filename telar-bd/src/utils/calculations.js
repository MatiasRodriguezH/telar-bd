export function calcularSubtotalDetalle(cantidad, precioUnitario) {
  return Number(cantidad || 0) * Number(precioUnitario || 0);
}

/**
 * Calcula subtotal, propina sugerida (10%) y total final de un PEDIDO.
 * detalles: [{ id_plato, cantidad, precio_unitario }]
 */
export function calcularTotalesPedido(detalles = [], propina = 0) {
  const subtotal = detalles.reduce(
    (acc, item) => acc + calcularSubtotalDetalle(item.cantidad, item.precio_unitario),
    0
  );
  const propinaSugerida = Math.round(subtotal * 0.1);
  const propinaFinal = Math.max(0, Number(propina || 0));

  return {
    subtotal,
    propinaSugerida,
    propina: propinaFinal,
    total: subtotal + propinaFinal,
  };
}

/**
 * Agrupa cuánto stock de cada id_ingrediente requiere un pedido completo,
 * sumando incluso cuando dos platos distintos comparten el mismo ingrediente.
 *
 * Retorna un objeto: { [id_ingrediente]: cantidadTotalRequerida }
 */
export function calcularConsumoIngredientes(detalles = [], recetas = []) {
  const consumo = {};

  for (const item of detalles) {
    const ingredientesDelPlato = recetas.filter(
      (r) => Number(r.id_plato) === Number(item.id_plato)
    );

    for (const rec of ingredientesDelPlato) {
      const idIng = Number(rec.id_ingrediente);
      const requerido = Number(item.cantidad) * Number(rec.cantidad_por_porcion);
      consumo[idIng] = Number(((consumo[idIng] || 0) + requerido).toFixed(3));
    }
  }

  return consumo;
}