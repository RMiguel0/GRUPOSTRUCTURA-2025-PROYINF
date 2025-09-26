// Controladores: reciben req/res y llaman a services.
export async function simulateLoan(req, res, next) {
  try {
    // Implementa la lógica llamando al service correspondiente.
    return res.json({ placeholder: true });
  } catch (err) { next(err); }
}
