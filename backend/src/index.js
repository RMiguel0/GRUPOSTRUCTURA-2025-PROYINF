import express from "express";
import cors from "cors";
import crypto from "node:crypto";

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" })); // Vite

// Stub: recibe la solicitud y responde con datos para ContractReview
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

  // Mock de scoring ultra simple
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
    }
  });
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Stub API listening on :${PORT}`));
