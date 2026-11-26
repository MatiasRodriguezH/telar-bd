import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/reset.css';   // 1. Limpia estilos por defecto del navegador
import './styles/tokens.css';  // 2. Define las variables de diseño (:root)
import './styles/global.css';  // 3. Aplica estilos globales
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';

// Punto de entrada de React: envuelve la app con Router, Toast y Auth
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
