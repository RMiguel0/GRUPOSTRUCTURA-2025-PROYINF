// src/components/BankComparison.jsx
import React from 'react'
import {
  calculateBankComparison,
  formatCurrency,
  formatPercentage,
} from '../utils/loanCalculations.js'
import {
  Banknote,
  BadgeCheck,
  ArrowDownRight,
  ArrowUpRight,
  Info,
} from 'lucide-react'

import '../styles/bank-comparison.css'

export default function BankComparison({
  amount = 0,
  termMonths = 0,
  currentRate = 0,
  bankRates = [],
}) {
  const current = calculateBankComparison(amount, termMonths, currentRate)

  const rows = (bankRates || []).map((b) => {
    const rate = b.avg_rate ?? b.rate ?? 0
    const calc = calculateBankComparison(amount, termMonths, rate)

    const deltaMonthly = current.monthlyPayment - calc.monthlyPayment
    const deltaTotal = current.totalAmount - calc.totalAmount
    const isBetter = deltaMonthly > 0

    return {
      name: b.bank_name ?? b.name ?? 'Bank',
      rate,
      monthly: calc.monthlyPayment,
      interest: calc.totalInterest,
      total: calc.totalAmount,
      isBetter,
      deltaMonthly,
      deltaTotal,
      minTerm: b.min_term_months ?? b.min_term ?? 0,
      maxTerm: b.max_term_months ?? b.max_term ?? 0,
    }
  })

  return (
    <section className="bc-card">
      {/* Header */}
      <div className="bc-header">
        <span className="bc-badge">
          <Banknote className="w-5 h-5" />
        </span>
        <h2 className="bc-title">Comparar Bancos</h2>
      </div>

      {/* Info bar */}
      <div className="bc-info">
        <Info className="w-4 h-4" />
        <span>
          Comparando ofertas de {rows.length} banco{rows.length === 1 ? '' : 's'} para un{' '}
          préstamo de {formatCurrency(amount)} a {termMonths} meses
        </span>
      </div>

      {/* Cards */}
      <div className="bc-list">
        {rows.map((r, i) => (
          <div
            key={i}
            className={"bc-offer"}
          >
            {/* Best deal badge */}
            {r.isBetter && (
              <span className="bc-best-pill">
                <BadgeCheck className="w-4 h-4" /> Mejor Oferta
              </span>
            )}

            {/* Grid 4 cols */}
            <div className="bc-grid">
              {/* Bank + avg rate */}
              <div>
                <p className="font-semibold">{r.name}</p>
                <p className="bc-subtle">Tasas:
                  {formatPercentage(r.rate - 0.7)} – {formatPercentage(r.rate + 0.8)}
                </p>

                <div className="mt-3">
                  <p className="bc-meta">Rango de tasas</p>
                  <p className="bc-val">{formatPercentage(r.rate)}</p>
                </div>
              </div>

              {/* Monthly */}
              <div>
                <p className="bc-meta">Pago Mensual</p>
                <p className="bc-val">{formatCurrency(r.monthly)}</p>
              </div>

              {/* Total interest */}
              <div>
                <p className="bc-meta">Interes Total</p>
                <p className="bc-val">{formatCurrency(r.interest)}</p>
              </div>

              {/* vs your rate */}
              <div className="text-right">
                <p className="bc-meta">vs Tu Tasa</p>

                {r.isBetter ? (
                  <div className="bc-delta-good">
                    <ArrowDownRight className="w-5 h-5" />
                    {formatCurrency(Math.abs(r.deltaMonthly))}{' '}
                    <span className="text-xs font-normal text-green-700/80">/ mo</span>
                  </div>
                ) : (
                  <div className="bc-delta-bad">
                    <ArrowUpRight className="w-5 h-5" />
                    {formatCurrency(Math.abs(r.deltaMonthly))}{' '}
                    <span className="text-xs font-normal text-red-600/80">/ mo</span>
                  </div>
                )}

                <p className="bc-subtle">
                  {r.isBetter ? 'Save' : 'Extra'} {formatCurrency(Math.abs(r.deltaTotal))} total
                </p>
              </div>
            </div>

            {/* Terms strip */}
            <div className="bc-terms">
              <span className="bc-subtle">
                Plazos disponibles: {r.minTerm || '?'} – {r.maxTerm || '?'} meses
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
