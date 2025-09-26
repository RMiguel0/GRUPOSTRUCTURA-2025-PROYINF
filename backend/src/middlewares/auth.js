// Middleware de autenticación/autorización (opcional).
export default function auth(_roles = []) {
  return (req, _res, next) => {
    // TODO: verificar token/rol si lo implementas.
    next();
  };
}
