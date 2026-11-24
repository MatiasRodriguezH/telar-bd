import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/reset.css';   // 1. Limpia estilos por defecto del navegador
import './styles/tokens.css';  // 2. Define las variables (:root)
import './styles/global.css';  // 3. Aplica estilos globales usando esas variables
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
