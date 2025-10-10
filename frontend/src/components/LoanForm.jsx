import React, { useState, useEffect } from "react"
import { Calculator } from "lucide-react"
import "../styles/loan-form.css"
import InterestChart from "./InterestChart.jsx"
import { calculateLoan, formatCurrency } from "../utils/loanCalculations.js"

const toNumber = (v) => Number(String(v).replace(",", ".")) || 0

export default function LoanForm({ onCalculate = () => {} }) {
  const [amount, setAmount] = useState(50000)
  const [interestRate, setInterestRate] = useState(5.5) // %
  const [termMonths, setTermMonths] = useState(60)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const calc = calculateLoan(amount, interestRate, termMonths)
    setResult(calc)
    onCalculate({
      amount, interestRate, termMonths,
      monthlyPayment: calc.monthlyPayment,
      totalInterest: calc.totalInterest,
      totalAmount: calc.totalAmount,
    })
  }, [amount, interestRate, termMonths])

  return (
    <div className="lf-card">
      <div className="lf-title">
        <span className="lf-title-badge"><Calculator className="w-4 h-4" /></span>
        <h2 className="lf-title-text">Calcular Crédito</h2>
      </div>

      <div className="lf-fields">
        {/* Monto */}
        <div>
          <div className="lf-head">
            <span> Monto de Solicitud: {formatCurrency(amount)}</span>
            <span className="lf-help">$1,000 — $500,000</span>
          </div>
          <input
            type="number" min={1000} max={500000} step={1000}
            value={amount}
            onChange={(e) => setAmount(toNumber(e.target.value))}
            className="lf-input"
          />
        </div>

        {/* Tasa (%) */}
        <div>
          <div className="lf-head">
            <span>Tasa de Interés: {interestRate.toFixed(2)}%</span>
            <span className="lf-help">0% — 20%</span>
          </div>
          <input
            type="number" min={0} max={20} step={0.1} inputMode="decimal"
            value={interestRate}
            onChange={(e) => setInterestRate(toNumber(e.target.value))}
            className="lf-input"
            placeholder="Ej: 5.5"
          />
        </div>

        {/* Plazo */}
        <div>
          <div className="lf-head">
            <span>Duración del Crédito: {(termMonths / 12).toFixed(0)} años</span>
            <span className="lf-help">1 año — 5 años</span>
          </div>
          <select
            value={termMonths}
            onChange={(e) => setTermMonths(Number(e.target.value))}
            className="lf-select"
          >
            <option disabled value="">-- Seleccione --</option>
            {Array.from({ length: 5 }, (_, i) => {
              const months = (i + 1) * 12
              const years = i + 1
              return (
                <option key={months} value={months}>
                  {years} {years === 1 ? "año" : "años"} ({months} meses)
                </option>
              )
            })}
          </select>
        </div>

        {/* Gráfico */}
        <div className="lf-chart-wrap">
          <p className="lf-chart-title">Principal vs Intereses en el tiempo</p>
          <div className="lf-chart-card">
            <div className="lf-chart-card-body">
              <InterestChart data={result || { schedule: [] }} />
              <div className="lf-legend">
                <div className="flex items-center gap-2">
                  <span className="lf-dot lf-dot--principal"></span> Principal
                </div>
                <div className="flex items-center gap-2">
                  <span className="lf-dot lf-dot--interest"></span> Intereses
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
