// src/utils/loanCalculations.js

// Formatea CLP (o cambia currency si quieres)
export function formatCurrency(value) {
  const n = Number(value) || 0
  return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })
}

export function formatPercentage(value) {
  const n = Number(value) || 0
  return `${n.toFixed(2)}%`
}

/**
 * Calcula cuota mensual usando tasa anual en PORCENTAJE (ej: 7.5)
 * y genera tabla de amortización.
 */
export function calculateLoan(amount, annualRatePercent, termMonths) {
  const P = Number(amount) || 0
  const n = Math.max(0, Math.floor(Number(termMonths) || 0))
  const r = (Number(annualRatePercent) || 0) / 100 / 12

  if (P <= 0 || n <= 0) {
    return {
      monthlyPayment: 0,
      totalInterest: 0,
      totalAmount: 0,
      schedule: [],
    }
  }

  // Cuota mensual (si r=0, pago lineal)
  const monthlyPayment =
    r === 0
      ? P / n
      : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)

  let balance = P
  let totalInterest = 0
  const schedule = []

  for (let month = 1; month <= n; month++) {
    const interest = r === 0 ? 0 : balance * r
    const principal = Math.min(balance, monthlyPayment - interest)
    balance = Math.max(0, balance - principal)
    totalInterest += interest

    schedule.push({
      month,
      interest,
      principalPortion: principal,
      balance,
    })
  }

  const totalAmount = P + totalInterest

  return {
    monthlyPayment,
    totalInterest,
    totalAmount,
    schedule,
  }
}

/**
 * Azúcar para comparación de bancos: usa calculateLoan con tasa anual %
 */
export function calculateBankComparison(amount, termMonths, annualRatePercent) {
  const res = calculateLoan(amount, annualRatePercent, termMonths)
  return {
    monthlyPayment: res.monthlyPayment,
    totalInterest: res.totalInterest,
    totalAmount: res.totalAmount,
    schedule: res.schedule,
  }
}
