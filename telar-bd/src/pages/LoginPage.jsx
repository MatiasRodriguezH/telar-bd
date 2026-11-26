import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Button, Card, Input } from '../components/ui/index.jsx';

// Cuentas de ejemplo cargadas en 08_PRUEBAS.sql para probar rápido
const CUENTAS_DEMO = [
  { usuario: 'BCONCHA', pass: 'Admin1234', cargo: 'ADMINISTRADOR' },
  { usuario: 'MRODRIGUEZ', pass: 'Garzon1234', cargo: 'GARZON' },
  { usuario: 'ACARIS', pass: 'Bodega1234', cargo: 'BODEGUERO' },
  { usuario: 'RMUNOZ', pass: 'Cocina1234', cargo: 'COCINERO' },
];

// Página de inicio de sesión exclusiva para empleados registrados en BCMRACUF_EMPLEADO
export default function LoginPage() {
  const { iniciarSesion } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);

  // Envía las credenciales al backend, el cual ejecuta BCMRACUF_F_VALIDAR_LOGIN en Oracle
  async function handleSubmit(e) {
    e.preventDefault();

    if (!usuario.trim() || !contrasena.trim()) {
      notify('warning', 'Ingresa tu usuario y contraseña.');
      return;
    }

    setCargando(true);
    try {
      const empleado = await iniciarSesion(usuario, contrasena);
      notify('success', `Bienvenido, ${empleado.NOMBRES}`);
      navigate('/reservas');
    } catch (err) {
      notify('error', err.message);
    } finally {
      setCargando(false);
    }
  }

  // Rellena los campos del formulario al hacer clic en una cuenta de prueba
  function usarCuentaDemo(cuenta) {
    setUsuario(cuenta.usuario);
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
              label="Usuario"
              placeholder="Ej: BCONCHA"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
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

        {/* Tarjeta de ayuda con los usuarios creados en 08_PRUEBAS.sql */}
        <Card padding="md">
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
            Cuentas de prueba (haz clic para autocompletar):
          </p>
          <div style={{ display: 'grid', gap: 'var(--space-1)' }}>
            {CUENTAS_DEMO.map((c) => (
              <button
                key={c.usuario}
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
                <strong>{c.usuario}</strong> / {c.pass} ({c.cargo})
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
