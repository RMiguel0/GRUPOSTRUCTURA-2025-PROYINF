// Punto de arranque del servidor.
// Lee variables y levanta la app en el puerto indicado.
import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
});
