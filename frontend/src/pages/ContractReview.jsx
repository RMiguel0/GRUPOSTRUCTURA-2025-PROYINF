// pages/ContractReview.jsx
import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ContractReview() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  const contract = state?.contract || null;
  const evaluation = state?.evaluation || null;

  // Fallback: intenta recuperar el contrato desde localStorage si no vino en state
  const fromStorage = useMemo(() => {
    try {
      const raw = localStorage.getItem('latestContract');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const record = contract || fromStorage?.contract || null;
  const evalResult = evaluation || fromStorage?.evaluation || null;

  // Manejar formatos
  const money = (n) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(Math.round(Number(n) || 0));

  const onConfirm = () => {
    // En el futuro podríamos enviar un update al backend para marcar como firmado.
    navigate('/', { replace: true, state: { contractAccepted: true } });
  };
  const onBack = () => navigate(-1);

  if (!record || !evalResult) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Revisión del Contrato</h1>
        <p>No se encontraron datos de contrato. Por favor inicia una solicitud primero.</p>
        <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 border rounded-lg">
          Ir al inicio
        </button>
      </div>
    );
  }

  // Derivar tasas como porcentaje
  const rateMonthlyPct = evalResult.interestRateMonthly
    ? (evalResult.interestRateMonthly * 100).toFixed(2)
    : '—';
  const rateAnnualPct = evalResult.interestRateAnnual
    ? (evalResult.interestRateAnnual * 100).toFixed(2)
    : '—';

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Resumen y Contrato</h1>

      <section className="mb-6 border rounded-xl p-4">
        <h2 className="font-medium mb-3">Datos del solicitante</h2>
        <ul className="text-sm leading-7">
          <li><strong>Nombre:</strong> {record.full_name ?? '—'}</li>
          <li><strong>RUT:</strong> {record.identification ?? '—'}</li>
          <li><strong>Email:</strong> {record.email ?? '—'}</li>
          <li><strong>Teléfono:</strong> {record.phone ?? '—'}</li>
        </ul>
      </section>

      <section className="mb-6 border rounded-xl p-4">
        <h2 className="font-medium mb-3">Detalles del crédito</h2>
        <ul className="text-sm leading-7">
          <li><strong>Monto solicitado:</strong> {money(record.requested_amount)}</li>
          <li><strong>Plazo:</strong> {record.requested_term_months} meses</li>
          <li><strong>Cuota mensual estimada:</strong> {money(evalResult.monthlyPayment)}</li>
          <li><strong>Tasa mensual:</strong> {rateMonthlyPct}%</li>
          <li><strong>Tasa anual equivalente:</strong> {rateAnnualPct}%</li>
          <li><strong>Riesgo:</strong> {evalResult.risk}</li>
          <li><strong>Score interno:</strong> {evalResult.score}</li>
        </ul>
      </section>

      <section className="mb-6 border rounded-xl p-4">
        <h2 className="font-medium mb-3">Cláusulas principales</h2>
        <ol className="list-decimal ml-5 text-sm space-y-2">
          <li>El solicitante declara que los datos ingresados son veraces.</li>
          <li>Las condiciones indicadas (tasa, cuota y plazo) son las que aplican al momento de este contrato.</li>
          <li>La firma electrónica o aceptación final se realizará en una etapa posterior.</li>
        </ol>
      </section>

      <div className="flex gap-3">
        <button onClick={onBack} className="px-4 py-2 rounded-lg border">
          Volver
        </button>
        <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: '#000000' }}>
          Confirmar
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-6">
        Solicitud creada: {new Date(record.created_at).toLocaleString()}
      </p>
    </div>
  );
}
