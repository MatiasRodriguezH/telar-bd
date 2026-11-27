# Como conectar a Orcle

---

## 1: Correr Oracle

### Oracle 23ai
En la raíz `~/Desktop/trabajo/`:
```bash
docker compose up -d
```
Espera ~40–60 segundos a que Oracle termine de iniciar (puedes verlo con `docker compose ps`, debe decir `healthy`).
Este contenedor ya crea automáticamente el usuario `RESTAURANTE_APP` con contraseña `Restaurante2026!` en `localhost:1521/FREEPDB1` (justo lo que ya viene en `backend/.env`).

---

## 2: Instalar dependencias del backend

```bash
cd ~/Desktop/trabajo/backend
npm install
```

---

## 3: Cargar los 8 archivos SQL de `database/` en Oracle

```bash
cd ~/Desktop/trabajo/backend
npm run db:setup
```

---

## 4: Levantar el Backend y el Frontend

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

Abre `http://localhost:5173` e inicia sesión con el RUT de cualquiera de las cuentas cargadas por `08_PRUEBAS.sql`:
- **Administrador:** `20.451.892-4` / `Admin1234`
- **Garzón:** `20.612.345-8` / `Garzon1234`
- **Bodeguero:** `20.789.123-1` / `Bodega1234`
- **Encargado:** `16.543.210-5` / `Encargado1234`

---