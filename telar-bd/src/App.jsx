import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CrearReservaPage from './pages/CrearReservaPage.jsx';
import ManejarReservasPage from './pages/ManejarReservasPage.jsx';
import GenerarPedidoPage from './pages/GenerarPedidoPage.jsx';
import ManejarPedidosPage from './pages/ManejarPedidosPage.jsx';
import InventarioPage from './pages/InventarioPage.jsx';
import EmpleadosPage from './pages/EmpleadosPage.jsx';

// Componente simple que protege las rutas privadas: si no hay sesión, manda al login
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

// Define todas las rutas (páginas) de la aplicación del restaurante
export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Ruta pública: si ya inició sesión lo redirige directo a /reservas */}
      <Route path="/login" element={user ? <Navigate to="/reservas" replace /> : <LoginPage />} />

      {/* Rutas privadas envueltas con el menú lateral (Layout) */}
      <Route
        path="/"
        element={
          <RutaPrivada>
            <Layout />
          </RutaPrivada>
        }
      >
        <Route index element={<Navigate to="/reservas" replace />} />
        <Route path="reservas/crear" element={<CrearReservaPage />} />
        <Route path="reservas" element={<ManejarReservasPage />} />
        <Route path="pedidos/crear" element={<GenerarPedidoPage />} />
        <Route path="pedidos" element={<ManejarPedidosPage />} />
        <Route path="inventario" element={<InventarioPage />} />
        <Route path="empleados" element={<EmpleadosPage />} />
      </Route>

      {/* Cualquier ruta desconocida vuelve al inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
