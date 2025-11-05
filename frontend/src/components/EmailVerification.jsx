import React, { useState } from "react";

/**
 * Componente para la verificación de correo electrónico mediante código OTP.
 * Al hacer clic en "Enviar código" se genera un OTP en el servidor y se
 * muestra un mensaje al usuario indicando que revise su correo electrónico.
 * Luego el usuario debe ingresar el código y presionar "Verificar".
 *
 * Por motivos de demostración y dado que no hay un servicio de email
 * configurado, el backend devuelve el código generado. Este componente no
 * muestra el código devuelto, pero lo almacena internamente para poder
 * compararlo con el que ingresa el usuario. En un entorno real, el código
 * se enviaría al email y no se devolvería en la respuesta.
 *
 * @param {string} email - El email del usuario que se va a verificar.
 * @param {function} onVerified - Callback a ejecutar cuando el código es correcto.
 */
export default function EmailVerification({ email, onVerified }) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [serverCode, setServerCode] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function sendCode() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("http://localhost:3000/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setServerCode(data.code);
        setStatus(
          "Se ha enviado un código a tu correo. Por favor, ingrésalo a continuación."
        );
      } else {
        setStatus(data.error || "No se pudo enviar el código.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Error al enviar código. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setLoading(true);
    setStatus(null);
    try {
      // En un entorno real llamaríamos al backend para verificar. Aquí
      // utilizamos el backend para validar el OTP. El servidor elimina la
      // clave al verificarla correctamente.
      const res = await fetch("http://localhost:3000/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("Código verificado correctamente ✅");
        if (onVerified) onVerified();
      } else {
        setStatus(data.error || "Código incorrecto. Intenta nuevamente.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Error al verificar el código.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2 max-w-sm">
      <p className="text-sm text-gray-700">
        Verificación de correo electrónico para <strong>{email}</strong>
      </p>
      {status && <p className="text-sm text-blue-600">{status}</p>}
      <button
        type="button"
        disabled={loading || sent}
        onClick={sendCode}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-400"
      >
        {loading && !sent ? "Enviando…" : sent ? "Código enviado" : "Enviar código"}
      </button>
      {sent && (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ingresa el código"
            className="border rounded-md px-2 py-1 flex-1"
          />
          <button
            type="button"
            disabled={loading || code.length === 0}
            onClick={verifyCode}
            className="px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-green-400"
          >
            {loading ? "Verificando…" : "Verificar"}
          </button>
        </div>
      )}
    </div>
  );
}