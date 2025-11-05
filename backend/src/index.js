import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import { generateOtp, saveOtp, verifyAndConsumeOtp } from "./utils/otp.js";

const app = express();
app.use(express.json());

// Si corres en Docker, muchas veces el frontend entra como http://localhost:5173 o http://127.0.0.1:5173
app.use(cors({
  origin: [/^http:\/\/localhost:5173$/, /^http:\/\/127\.0\.0\.1:5173$/],
}));

// --- Solicitud de préstamo (tu stub actual) ---
app.post("/api/applications", (req, res) => {
  const {
    identification,
    fullName,
    email,
    phone,
    monthlyIncome,
    employmentStatus,
    amount,
    termMonths,
    interestRate,
    dataConsent,
  } = req.body || {};

  const income = Math.max(1, Number(monthlyIncome || 0));
  const amt = Number(amount || 0);
  const dti = (amt / income) * 100;
  const score = Math.round(650 + Math.max(-100, 50 - dti));
  const decision = score >= 620 && dataConsent ? "pre-approved" : "referred";

  const applicationId = crypto.randomUUID();

  return res.status(201).json({
    applicationId,
    decision,
    score,
    dti: Number(dti.toFixed(2)),
    contractData: {
      applicationId,
      fullName,
      identification,
      email,
      phone,
      monthlyIncome,
      employmentStatus,
      amount,
      termMonths,
      interestRate,
    },
  });
});

// --- OTP: enviar ---
app.post("/api/otp/send", async (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== "string") {
    return res.status(400).json({ success: false, error: "invalid_email" });
  }

  const code = generateOtp(6);
  saveOtp(email, code, 10); // expira en 10 minutos

  // En demo devolvemos el código en el response.
  // En producción, envíalo por correo con Nodemailer y NO lo devuelvas.
  return res.json({ success: true, code });
});

// --- OTP: verificar ---
app.post("/api/otp/verify", (req, res) => {
  const { email, code } = req.body || {};
  if (!email || typeof email !== "string" || !code) {
    return res.status(400).json({ success: false, error: "missing_params" });
  }

  const result = verifyAndConsumeOtp(email, code);
  if (!result.ok) {
    const http = { not_found: 404, expired: 410, mismatch: 401 };
    return res.status(http[result.reason] || 400).json({ success: false, error: result.reason });
  }

  return res.json({ success: true });
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Stub API listening on :${PORT}`));
