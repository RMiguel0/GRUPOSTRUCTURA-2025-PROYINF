// src/utils/scoring.js
//
// This module encapsulates the basic scoring logic for loan applications.
// Given a requested amount, term, the applicant's declared monthly income and
// employment status, it calculates a credit score on a 0–100 scale. Based on
// that score it derives a risk category and an interest rate offer. If the
// score falls below the minimum acceptable threshold the loan is rejected.

/**
 * Calculate the constant monthly payment for an amortising loan using the
 * French annuity formula. If the term is zero the entire amount is used.
 *
 * @param {number} amount Principal of the loan (CLP)
 * @param {number} termMonths Number of months for repayment
 * @param {number} rate Monthly interest rate (e.g. 0.015 for 1.5%)
 * @returns {number} The fixed monthly instalment
 */
export function calculateMonthlyPayment(amount, termMonths, rate = 0.015) {
  const n = termMonths;
  const i = rate;
  if (!n || n <= 0) return amount;
  // Payment formula: A = P * [i / (1 - (1 + i)^-n)]
  return (amount * i) / (1 - Math.pow(1 + i, -n));
}

/**
 * Score the applicant's debt load relative to their income. A lower ratio of
 * monthly payment to monthly income yields a higher score. The returned
 * value is between 0 and 50.
 *
 * @param {number} monthlyPayment Estimated monthly payment of the requested loan
 * @param {number} monthlyIncome Applicant's declared monthly income
 * @returns {number}
 */
function scoreDebtLoad(monthlyPayment, monthlyIncome) {
  const ratio = monthlyPayment / monthlyIncome;
  if (!Number.isFinite(ratio) || ratio <= 0) return 50;
  if (ratio > 0.5) return 0;
  if (ratio > 0.4) return 15;
  if (ratio > 0.3) return 30;
  if (ratio > 0.2) return 40;
  return 50;
}

/**
 * Score the requested amount relative to the applicant's annual income. The
 * returned value is between 0 and 20.
 *
 * @param {number} amount Loan principal
 * @param {number} monthlyIncome Applicant's declared monthly income
 * @returns {number}
 */
function scoreAmountVsIncome(amount, monthlyIncome) {
  const annualIncome = monthlyIncome * 12;
  const ratio = amount / annualIncome;
  if (!Number.isFinite(ratio) || ratio <= 0) return 20;
  if (ratio > 2) return 0;
  if (ratio > 1) return 5;
  if (ratio > 0.5) return 10;
  return 20;
}

/**
 * Score the applicant's employment status. Full employment yields the
 * highest score and unemployment the lowest. The returned value is between
 * 0 and 15.
 *
 * @param {string} employmentStatus 'employed', 'self-employed', 'unemployed', etc.
 * @returns {number}
 */
function scoreEmploymentStatus(employmentStatus) {
  const status = (employmentStatus || '').toLowerCase();
  switch (status) {
    case 'employed':
    case 'empleado':
    case 'empleado/a':
      return 15;
    case 'self-employed':
    case 'independiente':
    case 'autonomo':
    case 'autónomo':
      return 8;
    case 'unemployed':
    case 'cesante':
    case 'desempleado':
    case 'desempleado/a':
      return 0;
    default:
      // If unknown, give a middle score
      return 10;
  }
}

/**
 * Compute the total credit score from the given inputs. This function does
 * not impose any business thresholds but simply returns the raw score and
 * intermediate values.
 *
 * @param {number} amount Requested loan amount
 * @param {number} termMonths Requested term in months
 * @param {number} monthlyIncome Declared monthly income
 * @param {string} employmentStatus Employment status string
 * @returns {{score: number, breakdown: {debtLoad: number, amountIncome: number, employment: number}, monthlyPayment: number}}
 */
export function computeScore(amount, termMonths, monthlyIncome, employmentStatus) {
  const payment = calculateMonthlyPayment(amount, termMonths);
  const debtLoadScore = scoreDebtLoad(payment, monthlyIncome);
  const amountIncomeScore = scoreAmountVsIncome(amount, monthlyIncome);
  const employmentScore = scoreEmploymentStatus(employmentStatus);
  const totalScore = debtLoadScore + amountIncomeScore + employmentScore;
  return {
    score: Math.round(totalScore),
    breakdown: {
      debtLoad: debtLoadScore,
      amountIncome: amountIncomeScore,
      employment: employmentScore,
    },
    monthlyPayment: Math.round(payment),
  };
}

/**
 * Derive the risk category and interest rate from a total score. If the
 * score is below 50 the applicant is considered high risk and the loan is
 * rejected (no rate is provided). Medium risk spans [50, 70) and low risk
 * >= 70.
 *
 * @param {number} score The computed credit score
 * @returns {{risk: string, interestRateMonthly: number|null, interestRateAnnual: number|null, rejected: boolean}}
 */
export function determineRiskAndRate(score) {
  if (score < 50) {
    return { risk: 'ALTO', interestRateMonthly: null, interestRateAnnual: null, rejected: true };
  }
  if (score < 70) {
    const rate = 0.02; // 2% monthly
    return {
      risk: 'MEDIO',
      interestRateMonthly: rate,
      interestRateAnnual: Math.pow(1 + rate, 12) - 1,
      rejected: false,
    };
  }
  const rate = 0.015; // 1.5% monthly
  return {
    risk: 'BAJO',
    interestRateMonthly: rate,
    interestRateAnnual: Math.pow(1 + rate, 12) - 1,
    rejected: false,
  };
}

/**
 * Perform a full evaluation of a loan application. It returns the score,
 * breakdown, risk, interest rate (or null if rejected) and a boolean
 * indicating if the loan is rejected.
 *
 * @param {number} amount Requested loan amount
 * @param {number} termMonths Requested term in months
 * @param {number} monthlyIncome Declared monthly income
 * @param {string} employmentStatus Employment status string
 * @returns {{score: number, risk: string, interestRateMonthly: number|null, interestRateAnnual: number|null, rejected: boolean, monthlyPayment: number, breakdown: {debtLoad: number, amountIncome: number, employment: number}}}
 */
export function evaluateApplication(amount, termMonths, monthlyIncome, employmentStatus) {
  const { score, breakdown, monthlyPayment } = computeScore(amount, termMonths, monthlyIncome, employmentStatus);
  const { risk, interestRateMonthly, interestRateAnnual, rejected } = determineRiskAndRate(score);
  return {
    score,
    risk,
    interestRateMonthly,
    interestRateAnnual,
    rejected,
    monthlyPayment,
    breakdown,
  };
}
