// src/components/SimulationHistory.jsx
import React from 'react'
import { History, Trash2 } from 'lucide-react'
import { formatCurrency, formatPercentage } from '../utils/loanCalculations.js'

import '../styles/simulation-history.css'

export default function SimulationHistory({ simulations = [], onDelete = () => {} }) {
  return (
    <section className="sh-card">
      {/* Título con ícono */}
      <div className="sh-title">
        <span className="sh-badge">
          <History className="w-5 h-5" />
        </span>
        <h2 className="sh-title-text">Simulaciones Guardadas</h2>
      </div>

      {/* Vacío */}
      {(!simulations || simulations.length === 0) && (
        <div className="sh-empty">
          No hay simulaciones guardadas. ¡Crea tu primera simulación arriba!
        </div>
      )}

      {/* Lista */}
      <ul className="sh-list">
        {simulations.map((s) => (
          <li
            key={s.id ?? `${s.amount}-${s.created_at}`}
            className="sh-item"
          >
            <div className="sh-grid">
              <div>
                <p className="sh-meta-label">Monto</p>
                <p className="sh-meta-value">{formatCurrency(s.amount)}</p>
              </div>

              <div>
                <p className="sh-meta-label">Tasa</p>
                <p className="sh-meta-value">{formatPercentage(s.interest_rate * 100 || 0)}</p>
              </div>

              <div>
                <p className="sh-meta-label">Plazo</p>
                <p className="sh-meta-value">{s.term_months} meses</p>
              </div>

              <div>
                <p className="sh-meta-label">Mensual</p>
                <p className="sh-meta-value">{formatCurrency(s.monthly_payment)}</p>
              </div>

              <div className="flex md:justify-end">
                <button
                  onClick={() => onDelete(s)}
                  title="Eliminar simulación"
                  className="sh-del"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
