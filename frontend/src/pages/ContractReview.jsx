// pages/ContractReview.jsx
import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ContractReview() {
  const location = useLocation();
  const navigate = useNavigate();

  const fromState = location?.state?.application;

  const fromStorage = useMemo(() => {
    try {
      const raw = localStorage.getItem("loanApplicationDraft");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // Fallback demo para que NUNCA quede en blanco
  const demo = {
    applicant: {
      fullName: "Juan Pérez",
      rut: "12.345.678-9",
      email: "juan.perez@example.com",
      phone: "+56 9 1234 5678",
    },
    loan: {
      amount: 2500000,
      termMonths: 36,
      interestRate: 1.2,
      bankPreference: "Structura Bank",
      purpose: "Consumo",
    },
    meta: { createdAt: new Date().toISOString(), source: "demo-fallback" },
  };

  const application = useMemo(
    () => fromState || fromStorage || demo,
    [fromState, fromStorage]
  );

  useEffect(() => {
    if (fromState) {
      try {
        localStorage.setItem("loanApplicationDraft", JSON.stringify(fromState));
      } catch {}
    }
  }, [fromState]);

  const money = (n) =>
    new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(
      Math.round(Number(n) || 0)
    );

  const onConfirm = () => navigate("/", { replace: true, state: { contractAccepted: true } });
  const onBack = () => navigate(-1);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Revisión del Contrato</h1>

      {(!fromState && !fromStorage) && (
        <div className="mb-4 text-xs rounded-md border px-3 py-2">
          Estás viendo datos de ejemplo porque entraste directo a <code>/contract-review</code>.
          Envía el formulario en <code>/apply</code> para ver tu información real.
        </div>
      )}

      <section className="mb-6 border rounded-xl p-4">
        <h2 className="font-medium mb-3">Datos del solicitante</h2>
        <ul className="text-sm leading-7">
          <li><strong>Nombre:</strong> {application?.applicant?.fullName ?? "—"}</li>
          <li><strong>RUT:</strong> {application?.applicant?.identification ?? "—"}</li>
          <li><strong>Email:</strong> {application?.applicant?.email ?? "—"}</li>
          <li><strong>Teléfono:</strong> {application?.applicant?.phone ?? "—"}</li>
        </ul>
      </section>

      <section className="mb-6 border rounded-xl p-4">
        <h2 className="font-medium mb-3">Detalles del crédito</h2>
        <ul className="text-sm leading-7">
          <li><strong>Monto:</strong> {money(application?.loan?.amount)}</li>
          <li><strong>Plazo:</strong> {application?.loan?.termMonths ?? "—"} meses</li>
          <li><strong>Tasa referencial:</strong> {application?.loan?.interestRate ?? "—"}% mensual</li>
          <li><strong>Banco preferencia:</strong> {application?.loan?.bankPreference ?? "—"}</li>
          <li><strong>Finalidad:</strong> {application?.loan?.purpose ?? "—"}</li>
        </ul>
      </section>

      <section className="mb-6 border rounded-xl p-4">
        <h2 className="font-medium mb-3">Cláusulas principales (demo)</h2>
        <ol className="list-decimal ml-5 text-sm space-y-2">
          <li>El solicitante declara que los datos ingresados son veraces.</li>
          <li>Las condiciones (tasa/plazo) son referenciales y pueden variar.</li>
          <li>La evaluación de riesgo puede requerir fuentes externas.</li>
        </ol>
      </section>

      <div className="flex gap-3">
        <button onClick={onBack} className="px-4 py-2 rounded-lg border">Volver</button>
        <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-black text-white">Confirmar</button>
      </div>

      <p className="text-xs text-gray-500 mt-6">
        Origen: <code>{application?.meta?.source ?? "desconocido"}</code> ·{" "}
        Creado: {application?.meta?.createdAt ? new Date(application.meta.createdAt).toLocaleString() : "—"}
      </p>
    </div>
  );
}
