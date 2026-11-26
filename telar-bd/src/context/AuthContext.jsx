import { createContext, useContext, useEffect, useState } from 'react';
import { getStoredToken } from '../services/api.js';
import { getMe, login as loginService, logout as logoutService } from '../services/auth.service.js';

const AuthContext = createContext(null);

// Proveedor que guarda el empleado conectado y lo comparte con toda la aplicación
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al cargar la página, revisamos si ya existía un token guardado para mantener la sesión
  useEffect(() => {
    async function verificarSesion() {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const empleado = await getMe();
        setUser(empleado);
      } catch {
        // Si el token expiró o el servidor rechazó la sesión, limpiamos el token
        logoutService();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    verificarSesion();
  }, []);

  // Llama al backend para validar RUT/contraseña y guarda el empleado en el estado
  async function iniciarSesion(rut, contrasena) {
    const empleado = await loginService(rut, contrasena);
    setUser(empleado);
    return empleado;
  }

  // Borra el token y limpia el usuario conectado
  function cerrarSesion() {
    logoutService();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook simple para acceder al usuario actual desde cualquier página
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
