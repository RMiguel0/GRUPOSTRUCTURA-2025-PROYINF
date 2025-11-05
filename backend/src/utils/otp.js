// Genera un OTP numérico de N dígitos
export function generateOtp(length = 6) {
  let code = '';
  for (let i = 0; i < length; i++) code += Math.floor(Math.random() * 10);
  return code;
}

// Map en memoria: email -> { code, expiresAt }
export const otpStore = new Map();

export function saveOtp(email, code, ttlMinutes = 10) {
  const expiresAt = Date.now() + ttlMinutes * 60_000;
  otpStore.set(email, { code, expiresAt });
}

export function verifyAndConsumeOtp(email, code, { consume = true } = {}) {
  const entry = otpStore.get(email);
  if (!entry) return { ok: false, reason: 'not_found' };
  const { code: saved, expiresAt } = entry;
  if (Date.now() > expiresAt) {
    otpStore.delete(email);
    return { ok: false, reason: 'expired' };
  }
  if (saved !== String(code)) return { ok: false, reason: 'mismatch' };
  if (consume) otpStore.delete(email);
  return { ok: true };
}
