import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import { callPlsql, executeSql, formatOracleError, oracledb, withConnection } from './db.js';

const app = express();
const PORT = Number(process.env.PORT || 3001);
const AUTH_SECRET = process.env.AUTH_SECRET || 'las_viejas_cochinas_secreto_2026';

app.use(cors());
app.use(express.json());

// =============================================================================
// UTILIDADES SIMPLES DE SESION (TOKEN FIRMADO CON HMAC-SHA256)
// =============================================================================

// Crea un token simple en base64 + firma para recordar qué empleado inició sesión
function crearToken(user) {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64url');
  const firma = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  return `${payload}.${firma}`;
}

// Verifica que el token no fue alterado y devuelve los datos del empleado
function leerToken(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, firma] = token.split('.');
  const esperada = crypto.createHmac('sha256', AUTH_SECRET).update(payload).digest('base64url');
  if (firma !== esperada) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

// Middleware: exige que el usuario venga autenticado con Authorization: Bearer <token>
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const user = leerToken(token);

  if (!user) {
    return res.status(401).json({ message: 'Debes iniciar sesión para realizar esta acción.' });
  }

  req.user = user;
  next();
}

// Helper para envolver rutas async y devolver errores limpios de Oracle
function handleRoute(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      const { status, message } = formatOracleError(err);
      res.status(status).json({ message });
    }
  };
}

// =============================================================================
// 1. ESTADO DEL SERVIDOR Y CONEXION A ORACLE
// =============================================================================

// Permite verificar rápidamente en el navegador si el backend está conectado a Oracle
app.get(
  '/api/health',
  handleRoute(async (_req, res) => {
    await executeSql('SELECT 1 AS OK FROM DUAL');
    res.json({ ok: true, database: 'Oracle conectada correctamente' });
  })
);

// =============================================================================
// 2. AUTENTICACION DE EMPLEADOS (BCMRACUF_F_VALIDAR_LOGIN)
// =============================================================================

// Valida usuario y contraseña llamando a la función almacenada en Oracle
app.post(
  '/api/auth/login',
  handleRoute(async (req, res) => {
    const { usuario, contrasena } = req.body || {};
    if (!usuario || !contrasena) {
      return res.status(400).json({ message: 'Ingresa usuario y contraseña.' });
    }

    const result = await callPlsql(
      `BEGIN :cargo := BCMRACUF_F_VALIDAR_LOGIN(:usuario, :contrasena); END;`,
      {
        cargo: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 },
        usuario: String(usuario).trim(),
        contrasena: String(contrasena),
      }
    );

    if (!result.cargo || result.cargo === 'INVALIDO' || result.cargo === 'ERROR') {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
    }

    // Si el login fue válido, consultamos los datos básicos del empleado (sin contraseña)
    const empQuery = await executeSql(
      `SELECT RUT_EMPLEADO, NOMBRES, APELLIDO_PATERNO, APELLIDO_MATERNO, CARGO, USUARIO
       FROM BCMRACUF_EMPLEADO
       WHERE UPPER(USUARIO) = UPPER(TRIM(:usuario))`,
      { usuario: String(usuario).trim() }
    );

    const user = empQuery.rows[0];
    const token = crearToken(user);
    res.json({ token, user });
  })
);

// Devuelve el empleado actualmente autenticado según su token
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json(req.user);
});

// =============================================================================
// 3. MANTENEDORES CRUD (05_CRUDS.sql)
// =============================================================================

// --- CLIENTES ---
app.get(
  '/api/crud/clientes',
  requireAuth,
  handleRoute(async (_req, res) => {
    const { cursor } = await callPlsql(`BEGIN BCMRACUF_SEL_CLIENTE(:cursor); END;`, {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    });
    res.json(cursor);
  })
);

app.post(
  '/api/crud/clientes',
  requireAuth,
  handleRoute(async (req, res) => {
    const { rut_cliente, nombres, apellido_paterno, apellido_materno, correo, telefono } = req.body;
    await callPlsql(
      `BEGIN BCMRACUF_CRUD_CLIENTE('I', :rut, :nombres, :pat, :mat, :correo, :tel); END;`,
      {
        rut: rut_cliente,
        nombres,
        pat: apellido_paterno,
        mat: apellido_materno || null,
        correo: correo || null,
        tel: telefono,
      }
    );
    res.status(201).json({ message: 'Cliente registrado correctamente.' });
  })
);

app.delete(
  '/api/crud/clientes/:rut',
  requireAuth,
  handleRoute(async (req, res) => {
    await callPlsql(`BEGIN BCMRACUF_CRUD_CLIENTE('D', :rut); END;`, {
      rut: req.params.rut,
    });
    res.json({ message: 'Cliente eliminado.' });
  })
);

// --- ACOMPANANTES ---
app.get(
  '/api/crud/acompanantes',
  requireAuth,
  handleRoute(async (_req, res) => {
    const { cursor } = await callPlsql(`BEGIN BCMRACUF_SEL_ACOMPANANTE(:cursor); END;`, {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    });
    res.json(cursor);
  })
);

// --- MESAS ---
app.get(
  '/api/crud/mesas',
  requireAuth,
  handleRoute(async (_req, res) => {
    const { cursor } = await callPlsql(`BEGIN BCMRACUF_SEL_MESA(:cursor); END;`, {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    });
    res.json(cursor);
  })
);

// --- EMPLEADOS ---
app.get(
  '/api/crud/empleados',
  requireAuth,
  handleRoute(async (_req, res) => {
    const { cursor } = await callPlsql(`BEGIN BCMRACUF_SEL_EMPLEADO(:cursor); END;`, {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    });
    res.json(cursor);
  })
);

app.post(
  '/api/crud/empleados',
  requireAuth,
  handleRoute(async (req, res) => {
    const b = req.body;
    await callPlsql(
      `BEGIN BCMRACUF_CRUD_EMPLEADO('I', :rut, :nombres, :pat, :mat, :cargo, :sueldo, :tel, :usuario, :contrasena); END;`,
      {
        rut: b.rut_empleado,
        nombres: b.nombres,
        pat: b.apellido_paterno,
        mat: b.apellido_materno || null,
        cargo: b.cargo,
        sueldo: Number(b.sueldo),
        tel: b.telefono || null,
        usuario: b.usuario,
        contrasena: b.contrasena,
      }
    );
    res.status(201).json({ message: 'Empleado creado correctamente.' });
  })
);

app.put(
  '/api/crud/empleados/:rut',
  requireAuth,
  handleRoute(async (req, res) => {
    const b = req.body;
    await callPlsql(
      `BEGIN BCMRACUF_CRUD_EMPLEADO('U', :rut, :nombres, :pat, :mat, :cargo, :sueldo, :tel, :usuario, :contrasena); END;`,
      {
        rut: req.params.rut,
        nombres: b.nombres || null,
        pat: b.apellido_paterno || null,
        mat: b.apellido_materno || null,
        cargo: b.cargo || null,
        sueldo: b.sueldo !== '' && b.sueldo != null ? Number(b.sueldo) : null,
        tel: b.telefono || null,
        usuario: b.usuario || null,
        contrasena: b.contrasena || null,
      }
    );
    res.json({ message: 'Empleado actualizado correctamente.' });
  })
);

app.delete(
  '/api/crud/empleados/:rut',
  requireAuth,
  handleRoute(async (req, res) => {
    await callPlsql(`BEGIN BCMRACUF_CRUD_EMPLEADO('D', :rut); END;`, {
      rut: req.params.rut,
    });
    res.json({ message: 'Empleado eliminado correctamente.' });
  })
);

// --- TURNOS ---
app.get(
  '/api/crud/turnos',
  requireAuth,
  handleRoute(async (_req, res) => {
    const { cursor } = await callPlsql(`BEGIN BCMRACUF_SEL_TURNO(:cursor); END;`, {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    });
    res.json(cursor);
  })
);

// --- CATEGORIAS Y PLATOS ---
app.get(
  '/api/crud/categorias',
  requireAuth,
  handleRoute(async (_req, res) => {
    const { cursor } = await callPlsql(`BEGIN BCMRACUF_SEL_CATEGORIA(:cursor); END;`, {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    });
    res.json(cursor);
  })
);

app.get(
  '/api/crud/platos',
  requireAuth,
  handleRoute(async (_req, res) => {
    const { cursor } = await callPlsql(`BEGIN BCMRACUF_SEL_PLATO(:cursor); END;`, {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    });
    res.json(cursor);
  })
);

// --- INGREDIENTES ---
app.get(
  '/api/crud/ingredientes',
  requireAuth,
  handleRoute(async (_req, res) => {
    const { cursor } = await callPlsql(`BEGIN BCMRACUF_SEL_INGREDIENTE(:cursor); END;`, {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    });
    res.json(cursor);
  })
);

app.post(
  '/api/crud/ingredientes',
  requireAuth,
  handleRoute(async (req, res) => {
    const { nombre, unidad_base, stock_actual } = req.body;
    const out = await callPlsql(
      `BEGIN BCMRACUF_CRUD_INGREDIENTE('I', :id, :nombre, :unidad, :stock); END;`,
      {
        id: { dir: oracledb.BIND_INOUT, type: oracledb.NUMBER, val: null },
        nombre,
        unidad: unidad_base,
        stock: Number(stock_actual || 0),
      }
    );
    res.status(201).json({ id_ingrediente: out.id, message: 'Ingrediente creado.' });
  })
);

app.put(
  '/api/crud/ingredientes/:id',
  requireAuth,
  handleRoute(async (req, res) => {
    const { nombre, unidad_base, stock_actual } = req.body;
    await callPlsql(
      `BEGIN BCMRACUF_CRUD_INGREDIENTE('U', :id, :nombre, :unidad, :stock); END;`,
      {
        id: { dir: oracledb.BIND_INOUT, type: oracledb.NUMBER, val: Number(req.params.id) },
        nombre: nombre || null,
        unidad: unidad_base || null,
        stock: stock_actual !== '' && stock_actual != null ? Number(stock_actual) : null,
      }
    );
    res.json({ message: 'Ingrediente actualizado.' });
  })
);

app.delete(
  '/api/crud/ingredientes/:id',
  requireAuth,
  handleRoute(async (req, res) => {
    await callPlsql(`BEGIN BCMRACUF_CRUD_INGREDIENTE('D', :id); END;`, {
      id: { dir: oracledb.BIND_INOUT, type: oracledb.NUMBER, val: Number(req.params.id) },
    });
    res.json({ message: 'Ingrediente eliminado.' });
  })
);

// --- PROVEEDORES Y BODEGAS ---
app.get(
  '/api/crud/proveedores',
  requireAuth,
  handleRoute(async (_req, res) => {
    const { cursor } = await callPlsql(`BEGIN BCMRACUF_SEL_PROVEEDOR(:cursor); END;`, {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    });
    res.json(cursor);
  })
);

app.get(
  '/api/crud/bodegas',
  requireAuth,
  handleRoute(async (_req, res) => {
    const { cursor } = await callPlsql(`BEGIN BCMRACUF_SEL_BODEGA(:cursor); END;`, {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    });
    res.json(cursor);
  })
);

// =============================================================================
// 4. LOS 5 GESTORES DE INFORMACION (06_GESTORES.sql)
// =============================================================================

// --- GESTOR 01: RESERVAS ---
app.get(
  '/api/gestores/reservas',
  requireAuth,
  handleRoute(async (_req, res) => {
    const { cursor } = await callPlsql(`BEGIN BCMRACUF_SEL_RESERVAS(:cursor); END;`, {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    });
    res.json(cursor);
  })
);

app.post(
  '/api/gestores/reservas',
  requireAuth,
  handleRoute(async (req, res) => {
    const { rut_cliente, num_mesa, inicio, fin, comensales, nombre_acompanante } = req.body;

    // Convertimos el formato de <input type="datetime-local"> (YYYY-MM-DDTHH:MM) a TIMESTAMP de Oracle
    const inicioStr = String(inicio || '').slice(0, 16);
    const finStr = String(fin || '').slice(0, 16);

    const out = await callPlsql(
      `BEGIN
         BCMRACUF_GESTOR_RESERVA(
           :id_reserva,
           :rut_cliente,
           :num_mesa,
           TO_TIMESTAMP(:inicio, 'YYYY-MM-DD"T"HH24:MI'),
           TO_TIMESTAMP(:fin, 'YYYY-MM-DD"T"HH24:MI'),
           :comensales,
           :nombre_acomp
         );
       END;`,
      {
        id_reserva: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        rut_cliente,
        num_mesa: Number(num_mesa),
        inicio: inicioStr,
        fin: finStr,
        comensales: Number(comensales),
        nombre_acomp: nombre_acompanante || null,
      }
    );

    res.status(201).json({ id_reserva: out.id_reserva, message: 'Reserva creada correctamente.' });
  })
);

// Permite cancelar/eliminar una reserva desde la página de Manejar Reservas
app.delete(
  '/api/gestores/reservas/:id',
  requireAuth,
  handleRoute(async (req, res) => {
    const result = await executeSql(
      `DELETE FROM BCMRACUF_RESERVA WHERE ID_RESERVA = :id`,
      { id: Number(req.params.id) },
      { autoCommit: true }
    );
    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: 'La reserva no existe.' });
    }
    res.json({ message: 'Reserva eliminada correctamente.' });
  })
);

// --- GESTOR 02: ASIGNACION DE TURNOS ---
app.get(
  '/api/gestores/turnos',
  requireAuth,
  handleRoute(async (_req, res) => {
    const { cursor } = await callPlsql(`BEGIN BCMRACUF_SEL_ASIGNACIONES(:cursor); END;`, {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    });
    res.json(cursor);
  })
);

app.post(
  '/api/gestores/turnos',
  requireAuth,
  handleRoute(async (req, res) => {
    const { rut_empleado, id_turno, fecha } = req.body;
    await callPlsql(
      `BEGIN BCMRACUF_GESTOR_TURNO(:rut, :id_turno, TO_DATE(:fecha, 'YYYY-MM-DD')); END;`,
      {
        rut: rut_empleado,
        id_turno: Number(id_turno),
        fecha: String(fecha || '').slice(0, 10),
      }
    );
    res.status(201).json({ message: 'Turno asignado correctamente.' });
  })
);

// --- GESTOR 03: PEDIDOS Y DETALLE ---
app.get(
  '/api/gestores/pedidos',
  requireAuth,
  handleRoute(async (_req, res) => {
    const { cursor } = await callPlsql(`BEGIN BCMRACUF_SEL_PEDIDOS(:cursor); END;`, {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    });
    res.json(cursor);
  })
);

// Obtiene los platos (detalle) de un pedido específico para verlos en Manejar Pedidos
app.get(
  '/api/gestores/pedidos/:id/detalle',
  requireAuth,
  handleRoute(async (req, res) => {
    const result = await executeSql(
      `SELECT DP.ID_PEDIDO,
              DP.ID_PLATO,
              P.NOMBRE AS NOMBRE_PLATO,
              DP.CANTIDAD,
              DP.PRECIO_UNITARIO,
              (DP.CANTIDAD * DP.PRECIO_UNITARIO) AS SUBTOTAL
       FROM BCMRACUF_DETALLE_PEDIDO DP
       JOIN BCMRACUF_PLATO P ON DP.ID_PLATO = P.ID_PLATO
       WHERE DP.ID_PEDIDO = :id
       ORDER BY P.NOMBRE`,
      { id: Number(req.params.id) }
    );
    res.json(result.rows);
  })
);

app.post(
  '/api/gestores/pedidos',
  requireAuth,
  handleRoute(async (req, res) => {
    const { num_mesa, rut_empleado, propina } = req.body;
    const out = await callPlsql(
      `BEGIN BCMRACUF_GESTOR_PEDIDO(:id_pedido, :num_mesa, :rut_empleado, :propina); END;`,
      {
        id_pedido: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        num_mesa: Number(num_mesa),
        rut_empleado: rut_empleado || req.user.RUT_EMPLEADO,
        propina: Number(propina || 0),
      }
    );
    res.status(201).json({ id_pedido: out.id_pedido, message: 'Pedido abierto correctamente.' });
  })
);

app.post(
  '/api/gestores/pedidos/:id/detalle',
  requireAuth,
  handleRoute(async (req, res) => {
    const { id_plato, cantidad } = req.body;
    const out = await callPlsql(
      `BEGIN BCMRACUF_GESTOR_DET_PEDIDO(:id_pedido, :id_plato, :cantidad, :total); END;`,
      {
        id_pedido: Number(req.params.id),
        id_plato: Number(id_plato),
        cantidad: Number(cantidad),
        total: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );
    res.status(201).json({ total_pedido: out.total, message: 'Plato agregado al pedido.' });
  })
);

// Elimina un pedido junto con su detalle dentro de una sola transacción en Oracle
app.delete(
  '/api/gestores/pedidos/:id',
  requireAuth,
  handleRoute(async (req, res) => {
    const id = Number(req.params.id);
    await withConnection(async (connection) => {
      await connection.execute(`DELETE FROM BCMRACUF_DETALLE_PEDIDO WHERE ID_PEDIDO = :id`, { id });
      await connection.execute(`DELETE FROM BCMRACUF_PEDIDO WHERE ID_PEDIDO = :id`, { id });
      await connection.commit();
    });
    res.json({ message: 'Pedido eliminado.' });
  })
);

// --- GESTOR 04: RECETAS ---
app.get(
  '/api/gestores/recetas',
  requireAuth,
  handleRoute(async (_req, res) => {
    const { cursor } = await callPlsql(`BEGIN BCMRACUF_SEL_RECETAS(:cursor); END;`, {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    });
    res.json(cursor);
  })
);

app.post(
  '/api/gestores/recetas',
  requireAuth,
  handleRoute(async (req, res) => {
    const { id_plato, id_ingrediente, cantidad_por_porcion } = req.body;
    await callPlsql(`BEGIN BCMRACUF_GESTOR_RECETA(:id_plato, :id_ing, :cant); END;`, {
      id_plato: Number(id_plato),
      id_ing: Number(id_ingrediente),
      cant: Number(cantidad_por_porcion),
    });
    res.status(201).json({ message: 'Receta guardada correctamente.' });
  })
);

// --- GESTOR 05: SUMINISTROS ---
app.get(
  '/api/gestores/suministros',
  requireAuth,
  handleRoute(async (_req, res) => {
    const { cursor } = await callPlsql(`BEGIN BCMRACUF_SEL_SUMINISTROS(:cursor); END;`, {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    });
    res.json(cursor);
  })
);

app.post(
  '/api/gestores/suministros',
  requireAuth,
  handleRoute(async (req, res) => {
    const { rut_proveedor, id_ingrediente, id_bodega, cantidad } = req.body;
    const out = await callPlsql(
      `BEGIN BCMRACUF_GESTOR_SUMINISTRO(:id_sum, :rut_prov, :id_ing, :id_bod, :cant, :nuevo_stock); END;`,
      {
        id_sum: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        rut_prov: rut_proveedor,
        id_ing: Number(id_ingrediente),
        id_bod: Number(id_bodega),
        cant: Number(cantidad),
        nuevo_stock: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );
    res.status(201).json({
      id_suministro: out.id_sum,
      nuevo_stock: out.nuevo_stock,
      message: `Suministro registrado. Nuevo stock: ${out.nuevo_stock}`,
    });
  })
);

// =============================================================================
// 5. LOS 3 REPORTES ESTRATEGICOS (07_REPORTES.sql)
// =============================================================================

app.get(
  '/api/reportes/ventas-plato',
  requireAuth,
  handleRoute(async (_req, res) => {
    const { cursor } = await callPlsql(`BEGIN BCMRACUF_REP_VENTAS_PLATO(:cursor); END;`, {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    });
    res.json(cursor);
  })
);

app.get(
  '/api/reportes/garzones',
  requireAuth,
  handleRoute(async (_req, res) => {
    const { cursor } = await callPlsql(`BEGIN BCMRACUF_REP_GARZONES(:cursor); END;`, {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    });
    res.json(cursor);
  })
);

app.get(
  '/api/reportes/inventario',
  requireAuth,
  handleRoute(async (_req, res) => {
    const { cursor } = await callPlsql(`BEGIN BCMRACUF_REP_INVENTARIO(:cursor); END;`, {
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    });
    res.json(cursor);
  })
);

app.listen(PORT, () => {
  console.log(`Backend de Las Viejas Cochinas corriendo en http://localhost:${PORT}`);
});
