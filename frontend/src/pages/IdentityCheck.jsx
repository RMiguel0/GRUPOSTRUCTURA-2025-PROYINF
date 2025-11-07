// pages/IdentityCheck.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EmailVerification from "../components/EmailVerification.jsx";
import FaceMatchCheck from "../components/FaceMatchCheck.jsx";
import { validarRUT } from "../utils/rutUtils.js";

/**
 * Esta vista concentra:
 *  1) Validación de RUT (automática)
 *  2) Verificación de correo (OTP con SendGrid)
 *  3) Coincidencia facial (foto documento vs cámara)
 *
 * Llega desde LoanApplicationForm con:
 *  - state.application (datos de solicitud)
 *  - state.idImageFile (File de la foto del documento)
 */
export default function IdentityCheck() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};

  // Normalizamos la entrada y damos un fallback de almacenamiento local
  const fromStateApp = state?.application || null;
  const fromStateIdFile = state?.idImageFile || null;

  const fromStorage = useMemo(() => {
    try {
      const raw = localStorage.getItem("loanApplicationDraft");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const application = useMemo(
    () => fromStateApp || fromStorage || null,
    [fromStateApp, fromStorage]
  );

  // ⚠️ Para la comparación facial necesitamos sí o sí el archivo del documento
  const idImageFile = fromStateIdFile;

  // Estados de verificación
  const [rutOk, setRutOk] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [faceOk, setFaceOk] = useState(false);

  // Para “Reintentar” la coincidencia facial remonta el componente
  const [faceRunId, setFaceRunId] = useState(0);

  // Valida RUT al montar
  useEffect(() => {
    const id = application?.applicant?.identification;
    setRutOk(Boolean(id) && validarRUT(id));
  }, [application]);

  // Guarda el application (para recuperación si recargan)
  useEffect(() => {
    if (fromStateApp) {
      try {
        localStorage.setItem("loanApplicationDraft", JSON.stringify(fromStateApp));
      } catch {}
    }
  }, [fromStateApp]);

  if (!application || !idImageFile) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Validación de identidad</h1>
        <div className="p-4 border rounded-lg">
          <h2 className="font-medium mb-2">Faltan datos</h2>
          <p className="text-sm text-gray-600">
            Vuelve al formulario y sube la imagen del documento para poder comparar el rostro.
          </p>
          <div className="mt-4">
            <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg border">
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  const email = application?.applicant?.email || "";

  const allOk = rutOk && emailVerified && faceOk;

  const handleContinue = () => {
    // Empacamos el estado de identidad para referencia en ContractReview (opcional)
    navigate("/contract-review", {
      state: {
        application,
        identity: {
          rutOk,
          emailVerified,
          faceOk,
          allOk,
        },
      },
      replace: true,
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-sm">
        ← Volver al formulario
      </button>

      <h1 className="text-2xl font-semibold mb-1">Validación de identidad</h1>
      <p className="text-gray-600 text-sm mb-6">
        Comprobemos que la persona del documento coincide contigo y que puedes recibir un código por correo.
      </p>

      {/* Datos del solicitante, como en ContractReview */}
      <section className="mb-6 border rounded-xl p-4">
        <h2 className="font-medium mb-3">Datos del solicitante</h2>
        <ul className="text-sm leading-7">
          <li><strong>Nombre:</strong> {application?.applicant?.fullName ?? "—"}</li>
          <li><strong>RUT:</strong> {application?.applicant?.identification ?? "—"}{" "}
            {application?.applicant?.identification && (
              rutOk ? <span className="text-green-600"> (válido) ✅</span> : <span className="text-red-600"> (inválido) ❌</span>
            )}
          </li>
          <li><strong>Email:</strong> {email || "—"}</li>
          <li><strong>Teléfono:</strong> {application?.applicant?.phone ?? "—"}</li>
        </ul>
      </section>

      {/* Verificación de correo (migrada desde ContractReview) */}
      <section className="mb-6 border rounded-xl p-4">
        <h2 className="font-medium mb-3">Verificación de correo</h2>
        {email ? (
          <EmailVerification
            email={email}
            onVerified={() => setEmailVerified(true)}
          />
        ) : (
          <p className="text-sm text-red-600">No hay email para verificar.</p>
        )}
      </section>

      {/* Coincidencia facial (documento vs cámara) */}
      <section className="mb-6 border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Verificación de coincidencia facial</h2>
          <button
            type="button"
            onClick={() => {
              setFaceOk(false);
              setFaceRunId((n) => n + 1); // remonta el componente para reintentar
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Reintentar
          </button>
        </div>

        <FaceMatchCheck
          key={faceRunId}
          idImageFile={idImageFile}
          onPassed={() => setFaceOk(true)}
          onFailed={() => setFaceOk(false)}
        />
      </section>

      {/* CTA */}
      <div className="flex gap-3">
        <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg border">
          Volver
        </button>
        <button
          onClick={handleContinue}
          disabled={!allOk}
          className="px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: allOk ? "#000000" : "#cccccc" }}
        >
          Continuar al contrato
        </button>
      </div>
    </div>
  );
}
