// Valida el formato de RUT chileno (ej: 18.456.789-2 o 18456789-2) dentro de VARCHAR2(12)
export function validarRut(rut = '') {
  const clean = String(rut).trim();
  return clean.length <= 12 && /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/.test(clean);
}

export function validarCorreo(correo = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(correo).trim());
}

export function validarRangoReserva(inicio, fin) {
  const dInicio = new Date(inicio);
  const dFin = new Date(fin);
  if (Number.isNaN(dInicio.getTime()) || Number.isNaN(dFin.getTime())) {
    return { valid: false, message: 'Las fechas de inicio y fin son obligatorias.' };
  }
  if (dFin <= dInicio) {
    return { valid: false, message: 'La hora de término debe ser posterior a la de inicio.' };
  }
  return { valid: true };
}

/**
 * Devuelve true si dos intervalos [inicioA, finA) y [inicioB, finB) se cruzan.
 */
export function haySolapamientoHorario(inicioA, finA, inicioB, finB) {
  const aIni = new Date(inicioA).getTime();
  const aFin = new Date(finA).getTime();
  const bIni = new Date(inicioB).getTime();
  const bFin = new Date(finB).getTime();
  return aIni < bFin && aFin > bIni;
}

export function validarCapacidadMesa(comensales, mesa) {
  const n = Number(comensales);
  if (!Number.isInteger(n) || n < 1) {
    return { valid: false, message: 'Debe ingresar al menos 1 comensal.' };
  }
  if (!mesa) {
    return { valid: false, message: 'La mesa seleccionada no existe.' };
  }
  if (n > mesa.capacidad) {
    return {
      valid: false,
      message: `La mesa #${mesa.num_mesa} tiene capacidad máxima para ${mesa.capacidad} comensales.`,
    };
  }
  return { valid: true };
}

export function validarRangoTurno(inicio_min, fin_min) {
  const ini = Number(inicio_min);
  const fin = Number(fin_min);
  if (ini < 0 || ini > 1439 || fin < 1 || fin > 1440) {
    return { valid: false, message: 'Los minutos del turno deben estar entre 00:00 y 24:00.' };
  }
  if (fin <= ini) {
    return { valid: false, message: 'La hora de fin del turno debe ser mayor que la de inicio.' };
  }
  return { valid: true };
}