// Repositorio: agrupa consultas SQL de 'loan'.
import { pool } from '../pool.js';
import crypto from 'node:crypto';

/**
 * Ensure the loan_application table exists with the required schema.
 * This helper will create the table if it doesn't exist.
 */
async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS loan_application (
      id uuid PRIMARY KEY,
      identification varchar(30) NOT NULL,
      full_name varchar(255) NOT NULL,
      email varchar(255),
      phone varchar(50),
      monthly_income numeric NOT NULL,
      employment_status varchar(50),
      requested_amount numeric NOT NULL,
      requested_term_months integer NOT NULL,
      score integer,
      risk varchar(10),
      interest_rate_monthly numeric,
      interest_rate_annual numeric,
      monthly_payment numeric,
      rejected boolean DEFAULT false,
      signed boolean DEFAULT false,
      created_at timestamp DEFAULT NOW()
    )
  `);
}

/**
 * Persist a loan application and its evaluation result.
 * Returns the inserted row.
 *
 * @param {object} payload Data to insert: identification, full_name, email, phone,
 * monthly_income, employment_status, requested_amount, requested_term_months,
 * score, risk, interest_rate_monthly, interest_rate_annual, monthly_payment, rejected
 */
export async function createLoanApplication(payload) {
  await ensureTable();
  const id = crypto.randomUUID();
  const {
    identification,
    full_name,
    email,
    phone,
    monthly_income,
    employment_status,
    requested_amount,
    requested_term_months,
    score,
    risk,
    interest_rate_monthly,
    interest_rate_annual,
    monthly_payment,
    rejected,
  } = payload;
  const { rows } = await pool.query(
    `
      INSERT INTO loan_application (
        id,
        identification,
        full_name,
        email,
        phone,
        monthly_income,
        employment_status,
        requested_amount,
        requested_term_months,
        score,
        risk,
        interest_rate_monthly,
        interest_rate_annual,
        monthly_payment,
        rejected,
        signed
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,false)
      RETURNING *
    `,
    [
      id,
      identification,
      full_name,
      email,
      phone,
      monthly_income,
      employment_status,
      requested_amount,
      requested_term_months,
      score,
      risk,
      interest_rate_monthly,
      interest_rate_annual,
      monthly_payment,
      rejected,
    ],
  );
  return rows[0];
}

export async function findById(id) {
  const { rows } = await pool.query('select * from loan_application where id = $1', [id]);
  return rows[0] ?? null;
}
