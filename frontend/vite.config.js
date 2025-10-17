import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  resolve: {
    extensions: ['.js', '.jsx'], // sin TS
  },
  optimizeDeps: {},              // propiedad válida, no variable suelta
})
