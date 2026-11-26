# Arquitectura de Base de Datos — Restaurante "Las Viejas Cochinas" (Oracle PL/SQL)

Esta carpeta contiene la arquitectura completa de la base de datos en **Oracle Database** (3ª Forma Normal, 16 tablas, 8 secuencias, 6 funciones, 17 triggers, 10 CRUDs, 5 gestores y 3 reportes).

## Orden de ejecución en Oracle

Ejecuta los scripts exactamente en este orden (desde SQL Developer, SQL*Plus o el script automático de `backend/`):

1. `01_TABLAS.sql` — Crea las 16 tablas (`BCMRACUF_*`), llaves primarias, foráneas y restricciones `UNIQUE`.
2. `02_SECUENCIAS.sql` — Crea las 8 secuencias (`BCMRACUF_SEQ_*`) para llaves auto-incrementales.
3. `03_FUNCIONES.sql` — Crea las 6 funciones almacenadas (`BCMRACUF_F_*`): login, formato de horas, disponibilidad de mesa, precio de plato, stock y total de pedido.
4. `04_TRIGGERS.sql` — Crea los triggers de normalización (mayúsculas), asignación automática de IDs, validación de reservas/recetas y actualización automática de stock al vender o recibir suministros.
5. `05_CRUDS.sql` — Crea los 10 mantenedores (`BCMRACUF_CRUD_*`) con operaciones `'I'`, `'U'`, `'D'` y sus cursores de lectura (`BCMRACUF_SEL_*`).
6. `06_GESTORES.sql` — Crea los 5 gestores transaccionales (`RESERVA`, `TURNO`, `PEDIDO`/`DET_PEDIDO`, `RECETA`, `SUMINISTRO`) y sus listados.
7. `07_REPORTES.sql` — Crea los 3 reportes gerenciales (`VENTAS_PLATO`, `GARZONES`, `INVENTARIO`).
8. `08_PRUEBAS.sql` — Carga los datos iniciales de prueba (clientes, mesas, empleados, platos, ingredientes, recetas, suministros, turnos, reservas y pedidos).

## Credenciales de prueba cargadas en `08_PRUEBAS.sql`

| Usuario | Contraseña | Cargo |
|---|---|---|
| `BCONCHA` | `Admin1234` | `ADMINISTRADOR` |
| `MRODRIGUEZ` | `Garzon1234` | `GARZON` |
| `UFIGUEROA` | `Garzon1234` | `GARZON` |
| `ACARIS` | `Bodega1234` | `BODEGUERO` |
| `RMUNOZ` | `Cocina1234` | `COCINERO` |
