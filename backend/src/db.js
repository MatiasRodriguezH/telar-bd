import oracledb from 'oracledb';

// Devuelve las filas como objetos { COLUMNA: valor } en vez de arreglos sin nombre
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let pool = null;

export { oracledb };

// Crea (una sola vez) y devuelve el pool de conexiones a Oracle usando backend/.env
export async function getPool() {
  if (!pool) {
    const { DB_USER, DB_PASSWORD, DB_CONNECT_STRING } = process.env;
    if (!DB_USER || !DB_PASSWORD || !DB_CONNECT_STRING) {
      throw new Error('Faltan DB_USER, DB_PASSWORD o DB_CONNECT_STRING en backend/.env');
    }

    pool = await oracledb.createPool({
      user: DB_USER,
      password: DB_PASSWORD,
      connectString: DB_CONNECT_STRING,
      poolMin: 1,
      poolMax: 10,
      poolIncrement: 1,
    });
  }
  return pool;
}

// Abre una conexión del pool, ejecuta una función y siempre cierra la conexión al terminar
export async function withConnection(callback) {
  const connection = await (await getPool()).getConnection();
  try {
    return await callback(connection);
  } finally {
    await connection.close();
  }
}

// Lee todas las filas de un SYS_REFCURSOR devuelto por Oracle y luego lo cierra
async function leerCursor(resultSet) {
  const filas = [];
  try {
    while (true) {
      const lote = await resultSet.getRows(200);
      if (!lote || lote.length === 0) break;
      filas.push(...lote);
    }
    return filas;
  } finally {
    await resultSet.close();
  }
}

// Ejecuta un bloque PL/SQL (procedimiento o función) y convierte cursores OUT a arreglos JS
export async function callPlsql(plsql, binds = {}) {
  return withConnection(async (connection) => {
    const result = await connection.execute(plsql, binds);
    const out = {};

    // Si el procedimiento devolvió variables OUT, revisamos si alguna es un cursor
    if (result.outBinds) {
      for (const [key, value] of Object.entries(result.outBinds)) {
        if (value && typeof value.getRows === 'function' && typeof value.close === 'function') {
          out[key] = await leerCursor(value);
        } else {
          out[key] = value;
        }
      }
    }

    return out;
  });
}

// Ejecuta una consulta SQL directa (por ejemplo SELECT o DELETE simple) con autoCommit opcional
export async function executeSql(sql, binds = {}, options = {}) {
  return withConnection(async (connection) => {
    return connection.execute(sql, binds, options);
  });
}

// Traduce los códigos ORA-xxxxx de Oracle a mensajes claros y códigos HTTP para el frontend
export function formatOracleError(err) {
  const msg = err?.message || 'Error interno en la base de datos Oracle.';

  // Errores propios lanzados con RAISE_APPLICATION_ERROR (-20000 a -20999)
  const customMatch = msg.match(/ORA-20\d{3}:\s*([^\n]+)/);
  if (customMatch) {
    return { status: 400, message: customMatch[1].trim() };
  }

  if (msg.includes('ORA-00001')) {
    return { status: 409, message: 'Ya existe un registro con ese dato único (RUT o usuario repetido).' };
  }
  if (msg.includes('ORA-02291')) {
    return { status: 400, message: 'Referencia inválida: el registro relacionado no existe.' };
  }
  if (msg.includes('ORA-02292')) {
    return { status: 409, message: 'No se puede eliminar porque existen otros registros asociados.' };
  }
  if (msg.includes('ORA-01400')) {
    return { status: 400, message: 'Falta completar uno o más campos obligatorios.' };
  }
  if (
    msg.includes('NJS-') ||
    msg.includes('ORA-12') ||
    msg.includes('ORA-01017') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('Faltan DB_USER')
  ) {
    return {
      status: 503,
      message: 'No se pudo conectar a Oracle Database. Revisa que Oracle esté activo y revisa backend/.env.',
    };
  }

  return { status: 500, message: msg };
}
