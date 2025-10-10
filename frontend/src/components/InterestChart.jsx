// src/components/InterestChart.jsx
import React, { useMemo } from 'react'
import '../styles/interest-chart.css'

export default function InterestChart({ data = [] }) {
  // Acepta tanto un array directo como { schedule: [...] }
  const schedule = useMemo(() => {
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.schedule)) return data.schedule
    return []
  }, [data])

  // Si no hay datos, muestra mensaje amigable
  if (!schedule.length) {
    return (
      <div className="text-sm text-gray-500 italic text-center py-4">
        No hay datos para graficar aún.
      </div>
    )
  }

  // Limitamos puntos para no saturar el SVG
  const maxSamples = 24
  const step = Math.ceil(schedule.length / maxSamples)
  const points = schedule.filter((_, i) => i % step === 0)

  const width = 640
  const height = 220
  const pad = 28

  const maxY = Math.max(...points.map(p => p.interest ?? p.interes ?? 0), 1)
  const xScale = i => pad + (i / (points.length - 1 || 1)) * (width - pad * 2)
  const yScale = v =>
    height - pad - ((v ?? 0) / maxY) * (height - pad * 2)

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(p.interest ?? p.interes ?? 0)}`)
    .join(' ')

  return (
    <div className="ic-wrap">
      <h3 className="ic-title">Interés por período</h3>
      <svg width={width} height={height} className="ic-svg">
        {/* Ejes */}
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#e5e7eb" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#e5e7eb" />

        {/* Línea de interés */}
        <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2" />

        {/* Puntos */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={xScale(i)}
            cy={yScale(p.interest ?? p.interes ?? 0)}
            r="2"
            fill="#2563eb"
          />
        ))}

        {/* Etiquetas */}
        <text x={pad} y={pad - 8} className="ic-axis">
          máx: {maxY.toLocaleString('es-CL')}
        </text>
        <text x={pad} y={height - pad + 16} className="ic-axis">
          0
        </text>
        <text x={width - pad - 20} y={height - pad + 16} className="ic-axis">
          n
        </text>
      </svg>
    </div>
  )
}
