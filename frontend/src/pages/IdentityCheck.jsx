// pages/IdentityCheck.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FaceMatchCheck from "../components/FaceMatchCheck.jsx";

/**
 * Espera recibir:
 *  - state.application  (o applicationData)
 *  - state.idImageFile  (File)  y/o  state.idImageDataURL (string)
 *  Además, intentará leer sessionStorage['idDocDataURL'] como respaldo.
 */
export default function IdentityCheck() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};

  const appData = state?.application || state?.applicationData || null;

  // puede venir por state o quedar persistido en sessionStorage
  const idImageFile = state?.idImageFile || null;
  const idImageDataURL =
    state?.idImageDataURL || sessionStorage.getItem("idDocDataURL") || null;

  if (!appData || (!idImageFile && !idImageDataURL)) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold">Faltan datos</h2>
        <p className="text-sm text-gray-600">
          Vuelve al formulario y sube la imagen del documento.
        </p>
      </div>
    );
  }

  const handleFaceMatchPassed = () => {
    navigate("/contract-review", {
      state: { application: appData, identityVerified: true },
      replace: true,
    });
  };

  const handleFaceMatchFailed = (reason) => {
    console.warn("Face match failed:", reason);
    // aquí puedes decidir si vuelves al form, permites reintento, etc.
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Validación de identidad</h1>
      <p className="text-gray-600 text-sm">
        Comprobemos que la persona del documento coincide contigo (sin prueba de vida).
      </p>

      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Verificación de coincidencia facial</h2>
        <FaceMatchCheck
          idImageFile={idImageFile}
          idImageDataURL={idImageDataURL}
          onPassed={handleFaceMatchPassed}
          onFailed={handleFaceMatchFailed}
        />
      </div>
    </div>
  );
}
