// src/components/LoanForm.jsx
import React, { useState, useEffect } from "react";
import { Calculator } from "lucide-react";

// estilos del componente (Tailwind + @apply)
import "../styles/loan-form.css";

// lógica/útiles
import InterestChart from "./InterestChart.jsx";
import { calculateLoan, formatCurrency } from "../utils/loanCalculations.js";

export default function LoanForm({ onCalculate = () => {} }) {
  // Estado controlado (tasa anual en %)
  const [amount, setAmount] = useState(50000);
  const [interestRate, setInterestRate] = useState(5.5); // %
  const [termMonths, setTermMonths] = useState(60);
  const [result, setResult] = useState(null);

  // Recalcular y notificar al padre
  useEffect(() => {
    const calc = calculateLoan(amount, interestRate, termMonths);
    setResult(calc);
    onCalculate({
      amount,
      interestRate,
      termMonths,
      monthlyPayment: calc.monthlyPayment,
      totalInterest: calc.totalInterest,
      totalAmount: calc.totalAmount,
    });
  }, [amount, interestRate, termMonths]);

  return (
    <div className="lf-card">
      {/* Título con badge */}
      <div className="lf-title">
        <span className="lf-title-badge">
          <Calculator className="w-5 h-5" />
        </span>
        <h2 className="lf-title-text">Calcular Credito</h2>
      </div>

      {/* Controles (sliders) */}
      <div className="lf-range-block">
        {/* Monto */}
        <div>
          <div className="lf-range-head">
            <span> Monto de Solicitud: {formatCurrency(amount)}</span>
            <span>$1,000 — $500,000</span>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="lf-range-input"
          />
        </div>

        {/* Tasa (%) */}
        <div>
          <div className="lf-range-head">
            <span>Tasa de Interés: {interestRate.toFixed(2)}%</span>
            <span>0% — 20%</span>
          </div>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="lf-range-input"
          />
        </div>

        {/* Plazo (meses) */}
        <div>
          <div className="lf-range-head">
            <span>
              Duración del Crédito: {(termMonths / 12).toFixed(0)} años
            </span>
            <span>1 año — 30 años</span>
          </div>

          <select
            value={termMonths}
            onChange={(e) => setTermMonths(Number(e.target.value))}
            className="lf-range-input border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring focus:ring-blue-300"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const months = (i + 1) * 12;
              const years = i + 1;
              return (
                <option key={months} value={months}>
                  {years} {years === 1 ? "año" : "años"} ({months} meses)
                </option>
              );
            })}
          </select>
        </div>

        {/* Gráfico */}
        <div className="lf-chart-wrap">
          <p className="lf-chart-title">Principal vs Intereses en el tiempo</p>
          <div className="lf-chart-card">
            <div className="lf-chart-card-body">
              <InterestChart data={result || { schedule: [] }} />

              {/* Leyenda */}
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
  );
}
