import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { getRutaInicial, puedeVerSeccion } from './utils/permissions.js';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CrearReservaPage from './pages/CrearReservaPage.jsx';
import ManejarReservasPage from './pages/ManejarReservasPage.jsx';
import GenerarPedidoPage from './pages/GenerarPedidoPage.jsx';
import ManejarPedidosPage from './pages/ManejarPedidosPage.jsx';
import InventarioPage from './pages/InventarioPage.jsx';
import EmpleadosPage from './pages/EmpleadosPage.jsx';
import ClientesPage from './pages/ClientesPage.jsx';
import MisTurnosPage from './pages/MisTurnosPage.jsx';

// Protege el acceso privado: exige que exista un empleado con sesión activa
function RutaPrivada({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p style={{ padding: '2rem' }}>Verificando sesión...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Protege una sección específica: si el cargo no tiene permiso, redirige a su pantalla inicial
function RutaPorRol({ seccion, children }) {
  const { user } = useAuth();

  if (!puedeVerSeccion(user?.CARGO, seccion)) {
    return <Navigate to={getRutaInicial(user?.CARGO)} replace />;
  }

  return children;
}

// Define todas las rutas de la aplicación y qué roles pueden entrar a cada una
export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Ruta pública: si ya inició sesión, va a la pantalla inicial de su cargo */}
      <Route
        path="/login"
        element={user ? <Navigate to={getRutaInicial(user.CARGO)} replace /> : <LoginPage />}
      />

      {/* Rutas privadas envueltas con el menú lateral (Layout) */}
      <Route
        path="/"
        element={
          <RutaPrivada>
            <Layout />
          </RutaPrivada>
        }
      >
        <Route index element={<Navigate to={getRutaInicial(user?.CARGO)} replace />} />

        <Route
          path="reservas/crear"
          element={
            <RutaPorRol seccion="reservas">
              <CrearReservaPage />
            </RutaPorRol>
          }
        />
        <Route
          path="reservas"
          element={
            <RutaPorRol seccion="reservas">
              <ManejarReservasPage />
            </RutaPorRol>
          }
        />
        <Route
          path="pedidos/crear"
          element={
            <RutaPorRol seccion="pedidos">
              <GenerarPedidoPage />
            </RutaPorRol>
          }
        />
        <Route
          path="pedidos"
          element={
            <RutaPorRol seccion="pedidos">
              <ManejarPedidosPage />
            </RutaPorRol>
          }
        />
        <Route
          path="mis-turnos"
          element={
            <RutaPorRol seccion="misTurnos">
              <MisTurnosPage />
            </RutaPorRol>
          }
        />
        <Route
          path="clientes"
          element={
            <RutaPorRol seccion="clientes">
              <ClientesPage />
            </RutaPorRol>
          }
        />
        <Route
          path="inventario"
          element={
            <RutaPorRol seccion="inventario">
              <InventarioPage />
            </RutaPorRol>
          }
        />
        <Route
          path="empleados"
          element={
            <RutaPorRol seccion="empleados">
              <EmpleadosPage />
            </RutaPorRol>
          }
        />
      </Route>

      {/* Cualquier ruta desconocida vuelve al inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
