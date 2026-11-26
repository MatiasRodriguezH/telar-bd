import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  CalendarPlus,
  CalendarCheck,
  UtensilsCrossed,
  ClipboardList,
  Package,
  Users,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Badge, Button } from './ui/index.jsx';
import { CARGO_CONFIG } from '../utils/formatters.js';
import './Layout.css';

// Menú principal con enlaces a cada una de las páginas del sistema
const MENU_ITEMS = [
  { to: '/reservas/crear', label: 'Crear Reserva', icon: CalendarPlus },
  { to: '/reservas', label: 'Manejar Reservas', icon: CalendarCheck, end: true },
  { to: '/pedidos/crear', label: 'Generar Pedido', icon: UtensilsCrossed },
  { to: '/pedidos', label: 'Manejar Pedidos', icon: ClipboardList, end: true },
  { to: '/inventario', label: 'Inventario', icon: Package },
  { to: '/empleados', label: 'Empleados', icon: Users },
];

// Marco principal que envuelve todas las páginas privadas con el menú lateral
export default function Layout() {
  const { user, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  // Cierra la sesión del empleado y lo devuelve al login
  function handleLogout() {
    cerrarSesion();
    navigate('/login');
  }

  const cargoInfo = CARGO_CONFIG[user?.CARGO] || { label: user?.CARGO, variant: 'neutral' };

  return (
    <div className="app-layout">
      {/* Barra lateral de navegación */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>Las Viejas Cochinas</h1>
          <p>Sistema de Gestión — Talca</p>
        </div>

        <nav className="sidebar-nav">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Información del empleado logueado y botón de salida */}
        <div className="sidebar-user">
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
            {user?.NOMBRES} {user?.APELLIDO_PATERNO}
          </div>
          <div>
            <Badge variant={cargoInfo.variant}>{cargoInfo.label}</Badge>
          </div>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            <LogOut size={15} /> Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Outlet muestra aquí la página que corresponde a la ruta actual */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
