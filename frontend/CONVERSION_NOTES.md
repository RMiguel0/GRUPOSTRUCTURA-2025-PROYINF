# Frontend (JSX) convertido desde `seleccionado`
- Stack: React + Vite, **sin TypeScript**.
- Para correr localmente:
  ```bash
  npm install
  npm run dev
  ```
- Para construir:
  ```bash
  npm run build
  ```

## Integración sugerida con `GRUPOSTRUCTURA-2025-PROYINF`
1. Mover esta carpeta a `GRUPOSTRUCTURA-2025-PROYINF/frontend` (o `apps/web`).
2. Desde la raíz del monorepo, añadir un proxy en `vite.config.js` para apuntar al backend Node (puerto 3000 o el que uses).
3. Copiar variables de `.env` relevantes (por ejemplo, SUPABASE_URL si aplica).
4. Unificar estilos y rutas según tu layout.
