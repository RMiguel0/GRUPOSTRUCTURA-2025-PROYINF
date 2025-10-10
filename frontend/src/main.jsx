import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'           // 👈 extensión .jsx explícita
import './index.css'                  // si usas Tailwind o estilos

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
