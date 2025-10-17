import { Building2, TrendingDown, TrendingUp } from 'lucide-react';
import { calculateBankComparison, formatCurrency, formatPercentage } from '../utils/loanCalculations.js';

/**
 * Display a comparison of different bank offers for a given loan.
 *
 * @param {Object} props
 * @param {number} props.amount The principal amount of the loan.
 * @param {number} props.termMonths The loan term in months.
 * @param {number} props.currentRate The current interest rate to compare against.
 * @param {Array<Object>} props.bankRates A list of bank rate objects returned from the backend.
 */
export function BankComparison({ amount, termMonths, currentRate, bankRates }) {
  // Calculate a comparison for each bank and sort the result by monthly payment
  const comparisons = (bankRates || [])
    .map((bank) => {
      const calculation = calculateBankComparison(amount, termMonths, bank.avg_rate);
      const currentCalculation = calculateBankComparison(amount, termMonths, currentRate);
      const difference = calculation.monthlyPayment - currentCalculation.monthlyPayment;
      const totalDifference = calculation.totalAmount - currentCalculation.totalAmount;

      return {
        bank,
        calculation,
        difference,
        totalDifference,
        isBetter: difference < 0,
      };
    })
    .sort((a, b) => a.calculation.monthlyPayment - b.calculation.monthlyPayment);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-100 rounded-lg">
          <Building2 className="w-6 h-6 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Comparacion de bancos</h2>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          Comparando ofertas de {bankRates.length} banco
          {bankRates.length === 1 ? '' : 's'} {formatCurrency(amount)} para un prestamo de {termMonths} meses
        </p>
      </div>

      <div className="grid gap-4">
        {comparisons.map(({ bank, calculation, difference, totalDifference, isBetter }) => (
          <div
            key={bank.id}
            className={`p-5 rounded-lg border-2 transition-all ${
              isBetter
                ? 'bg-green-50 border-green-300 hover:border-green-400'
                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{bank.bank_name}</h3>
                <p className="text-sm text-gray-600">
                  Tarifas {formatPercentage(bank.min_rate)} - {formatPercentage(bank.max_rate)}
                </p>
              </div>
              {isBetter && (
                <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                  Mejor contrato
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Promedio de Tarifa</p>
                <p className="text-lg font-bold text-gray-800">{formatPercentage(bank.avg_rate)}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">Pago Mensual</p>
                <p className="text-lg font-bold text-gray-800">
                  {formatCurrency(calculation.monthlyPayment)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">Interes total</p>
                <p className="text-lg font-bold text-gray-800">
                  {formatCurrency(calculation.totalInterest)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">vs tu Tarifa</p>
                <div className="flex items-center gap-1">
                  {isBetter ? (
                    <TrendingDown className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-red-600" />
                  )}
                  <p
                    className={`text-lg font-bold ${
                      isBetter ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {isBetter ? '' : '+'}
                    {formatCurrency(Math.abs(difference))}
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  {isBetter ? 'Ahorro' : 'Extra'} {formatCurrency(Math.abs(totalDifference))} total
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Términos disponibles: {bank.min_term_months} - {bank.max_term_months} meses
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}