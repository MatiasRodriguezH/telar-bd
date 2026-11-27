import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getRutaInicial } from '../utils/permissions.js';
import { Button, Card, Input } from '../components/ui/index.jsx';

// Cuentas de ejemplo cargadas en 08_PRUEBAS.sql (el inicio de sesión es con RUT)
const CUENTAS_DEMO = [
  { rut: '20.451.892-4', nombre: 'Bárbara Concha', pass: 'Admin1234', cargo: 'ADMINISTRADOR' },
  { rut: '16.543.210-5', nombre: 'Rosa Muñoz', pass: 'Encargado1234', cargo: 'ENCARGADO' },
  { rut: '20.612.345-8', nombre: 'Matías Rodríguez', pass: 'Garzon1234', cargo: 'GARZON' },
  { rut: '20.789.123-1', nombre: 'Alejandro Caris', pass: 'Bodega1234', cargo: 'BODEGUERO' },
];

// Página de inicio de sesión exclusiva para empleados registrados en BCMRACUF_EMPLEADO
export default function LoginPage() {
  const { iniciarSesion } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [rut, setRut] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);

  // Envía las credenciales al backend, que valida RUT y contraseña contra BCMRACUF_EMPLEADO
  async function handleSubmit(e) {
    e.preventDefault();

    if (!rut.trim() || !contrasena.trim()) {
      notify('warning', 'Ingresa tu RUT y contraseña.');
      return;
    }

    setCargando(true);
    try {
      const empleado = await iniciarSesion(rut, contrasena);
      notify('success', `Bienvenido, ${empleado.NOMBRES}`);
      navigate(getRutaInicial(empleado.CARGO));
    } catch (err) {
      notify('error', err.message);
    } finally {
      setCargando(false);
    }
  }

  // Rellena los campos del formulario al hacer clic en una cuenta de prueba
  function usarCuentaDemo(cuenta) {
    setRut(cuenta.rut);
    setContrasena(cuenta.pass);
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px', display: 'grid', gap: 'var(--space-4)' }}>
        <Card padding="lg">
          <div style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--primary)' }}>
              Las Viejas Cochinas
            </h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Acceso de personal del restaurante
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <Input
              label="RUT de empleado"
              placeholder="Ej: 20.451.892-4"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
            <Button type="submit" loading={cargando} style={{ width: '100%' }}>
              Ingresar
            </Button>
          </form>
        </Card>

        {/* Tarjeta de ayuda con los empleados creados en 08_PRUEBAS.sql */}
        <Card padding="md">
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
            Cuentas de prueba (haz clic para autocompletar):
          </p>
          <div style={{ display: 'grid', gap: 'var(--space-1)' }}>
            {CUENTAS_DEMO.map((c) => (
              <button
                key={c.rut}
                type="button"
                onClick={() => usarCuentaDemo(c)}
                style={{
                  textAlign: 'left',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  fontSize: 'var(--text-xs)',
                }}
              >
                <strong>{c.rut}</strong> — {c.nombre} ({c.cargo}) · clave: {c.pass}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
