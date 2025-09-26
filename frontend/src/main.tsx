// Punto de entrada de React. Renderiza la app.
import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return <div style={{padding: 24}}>
    <h1>Frontend listo</h1>
    <p>Configura rutas y páginas en src/app/routes y src/pages</p>
  </div>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
