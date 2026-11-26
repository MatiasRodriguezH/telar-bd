# Guía Paso a Paso: Cómo Conectar el Proyecto a Oracle Database

Esta aplicación usa **3 piezas simples**:
1. **Base de datos Oracle** (donde viven tus 8 scripts de `database/`).
2. **Backend Node.js (`backend/`)** usando `oracledb` en **modo Thin** (no necesitas instalar Oracle Instant Client).
3. **Frontend React (`telar-bd/`)** que se comunica con el backend por `http://localhost:3001/api`.

---

## Paso 1: Tener Oracle corriendo (elige la opción que uses)

### Opción A: Oracle 23ai Free con Docker (la más rápida en Linux)
En la raíz `~/Desktop/trabajo/`:
```bash
docker compose up -d
```
Espera ~40–60 segundos a que Oracle termine de iniciar (puedes verlo con `docker compose ps`, debe decir `healthy`).
Este contenedor ya crea automáticamente el usuario `RESTAURANTE_APP` con contraseña `Restaurante2026!` en `localhost:1521/FREEPDB1` (justo lo que ya viene en `backend/.env`).

### Opción B: Oracle XE local o servidor Oracle de la universidad
1. Abre tu archivo `backend/.env` y reemplaza estas 3 líneas con tus datos reales:
   ```env
   DB_USER=TU_USUARIO_ORACLE
   DB_PASSWORD=TU_CONTRASENA_ORACLE
   DB_CONNECT_STRING=HOST:1521/SERVICIO
   ```
   - Para Oracle XE local suele ser `localhost:1521/XEPDB1` o `localhost:1521/XE`.
   - Para servidor universitario, usa la IP/host, puerto y Service Name o SID que te dieron en clase.

---

## Paso 2: Instalar dependencias del backend

```bash
cd ~/Desktop/trabajo/backend
npm install
```

---

## Paso 3: Cargar los 8 archivos SQL de `database/` en Oracle

Tienes **dos formas** (usa la que prefieras):

### Forma automática (1 comando desde terminal)
```bash
cd ~/Desktop/trabajo/backend
npm run db:setup
```
Esto ejecuta en orden exacto `01_TABLAS.sql` -> `08_PRUEBAS.sql` sobre el Oracle configurado en `backend/.env`.

### Forma manual (desde Oracle SQL Developer)
Conéctate con el mismo usuario de `backend/.env` y ejecuta los archivos de `database/` **en orden del 01 al 08** (con `F5` / *Run Script*).

---

## Paso 4: Levantar el Backend y el Frontend

Abre **dos terminales**:

**Terminal 1 — Backend (puerto 3001):**
```bash
cd ~/Desktop/trabajo/backend
npm run dev
```

Verifica que Oracle respondió entrando en tu navegador a:
- `http://localhost:3001/api/health` -> debe mostrar `{"ok":true,"database":"Oracle conectada correctamente"}`

**Terminal 2 — Frontend React (puerto 5173):**
```bash
cd ~/Desktop/trabajo/telar-bd
npm run dev
```

Abre `http://localhost:5173` e inicia sesión con cualquiera de las cuentas cargadas por `08_PRUEBAS.sql`:
- **Administrador:** `BCONCHA` / `Admin1234`
- **Garzón:** `MRODRIGUEZ` / `Garzon1234`
- **Bodeguero:** `ACARIS` / `Bodega1234`
- **Cocinero:** `RMUNOZ` / `Cocina1234`

---

## Errores frecuentes y cómo resolverlos

- **`ORA-01017: invalid username/password`:** Revisa `DB_USER` y `DB_PASSWORD` en `backend/.env`.
- **`ECONNREFUSED` / `NJS-511`:** Oracle aún está iniciando o el puerto `1521` no coincide con `DB_CONNECT_STRING`.
- **`ORA-00942: table or view does not exist`:** Falta ejecutar los scripts de `database/` (corre `npm run db:setup` o ejecútalos en SQL Developer con el mismo usuario de `backend/.env`).
- **Cambios en `.env`:** Cada vez que edites `backend/.env`, reinicia el backend (`Ctrl + C` y `npm run dev`).
