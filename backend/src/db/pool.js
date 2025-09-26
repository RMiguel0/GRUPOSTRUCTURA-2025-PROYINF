// Pool de conexiones a PostgreSQL usando 'pg'.
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});
