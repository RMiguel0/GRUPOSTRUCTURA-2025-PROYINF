// Repositorio: agrupa consultas SQL de 'loan'.
import { pool } from '../pool.js';

export async function findById(id) {
  const { rows } = await pool.query('select * from loan_application where id = $1', [id]);
  return rows[0] ?? null;
}
