import React from "react";
import { DollarSign, Percent, CalendarDays } from "lucide-react";
import { formatCurrency } from "../utils/loanCalculations.js";

import "../styles/financial-overview.css";

export default function FinancialOverview({
  amount = 0,
  totalInterest = 0,
  totalAmount = 0,
  interestRate = 0,
  termMonths = 0,
}) {
  const interestPct = amount > 0 ? (totalInterest / amount) * 100 : 0;

  const Stat = ({ title, value, icon, bg, text }) => (
    <div className={`fo-stat ${bg}`}>
      <div className="fo-stat-inner">
        <span className="fo-stat-icon">{icon}</span>
        <p className="fo-stat-title">{title}</p>
      </div>
      <p className={`fo-stat-value ${text}`}>{value}</p>
    </div>
  );

  return (
    <div className="fo-card">
      <div className="fo-header">
        <span className="fo-badge">
          <CalendarDays className="w-5 h-5" />
        </span>
        <h2 className="fo-title">Resumen Financiero</h2>
      </div>

      <div className="fo-grid">
        <div className="fo-stat fo-stat--blue">
          <div className="fo-stat-inner">
            <span className="fo-stat-icon">
              <DollarSign className="w-5 h-5" />
            </span>
            <p className="fo-stat-title">Pago Mensual</p>
          </div>
          <p className="fo-stat-value">
            {formatCurrency(
              totalAmount && termMonths ? totalAmount / termMonths : 0
            )}
          </p>
        </div>

        <div className="fo-stat fo-stat--green">
          <div className="fo-stat-inner">
            <span className="fo-stat-icon">
              <DollarSign className="w-5 h-5" />
            </span>
            <p className="fo-stat-title">Monto del Préstamo</p>
          </div>
          <p className="fo-stat-value">{formatCurrency(amount)}</p>
        </div>

        <div className="fo-stat fo-stat--orange">
          <div className="fo-stat-inner">
            <span className="fo-stat-icon">
              <Percent className="w-5 h-5" />
            </span>
            <p className="fo-stat-title">% Interés Total</p>
          </div>
          <div className="whitespace-pre-line fo-stat-value">
            {`${formatCurrency(totalInterest)}\n${interestPct.toFixed(
              2
            )}% del principal`}
          </div>
        </div>

        <div className="fo-stat fo-stat--gray">
          <div className="fo-stat-inner">
            <span className="fo-stat-icon">
              <CalendarDays className="w-5 h-5" />
            </span>
            <p className="fo-stat-title">Costo Total</p>
          </div>
          <div className="whitespace-pre-line fo-stat-value">
            {`${formatCurrency(
              totalAmount
            )}\n${termMonths} meses a ${interestRate.toFixed(2)}%`}
          </div>
        </div>
      </div>
    </div>
  );
}
