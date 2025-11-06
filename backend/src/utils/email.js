import sgMail from "@sendgrid/mail";

const API_KEY = process.env.SENDGRID_API_KEY;
const MAIL_FROM = process.env.MAIL_FROM;
const APP_NAME = process.env.APP_NAME || "App";

if (!API_KEY) {
  console.error("[SendGrid] Falta SENDGRID_API_KEY en el entorno");
} else {
  sgMail.setApiKey(API_KEY);
}

export async function sendOtpEmail({ to, code }) {
  const msg = {
    to,
    from: MAIL_FROM,
    subject: `[${APP_NAME}] Tu código de verificación`,
    text: `Tu código es ${code}. Expira en 10 minutos.`,
    html: `
      <div style="font-family:sans-serif">
        <h2>${APP_NAME}</h2>
        <p>Tu código de verificación es:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:2px">${code}</p>
        <p>Expira en 10 minutos.</p>
      </div>`,
  };

  try {
    await sgMail.send(msg);
    console.log(`[SendGrid] Correo enviado a ${to}`);
    return { ok: true };
  } catch (err) {
    console.error("[SendGrid] Error:", err);
    return { ok: false, error: err.message };
  }
}
