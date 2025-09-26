// Config básica de Vite para React/TS. Ajusta si agregas alias, proxies, etc.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 }
})
