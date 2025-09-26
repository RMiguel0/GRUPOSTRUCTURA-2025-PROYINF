// Middleware de validación (usa Joi/Zod si quieres).
export default function validate(_schema) {
  return (req, _res, next) => {
    // TODO: validar req.body con el esquema y sanitizar.
    next();
  };
}
