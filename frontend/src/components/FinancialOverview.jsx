import { TrendingUp, DollarSign, Percent, Calendar } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/loanCalculations.js';

/**
 * Shows a summary of the loan including monthly payment, principal amount,
 * total interest and total cost. All values are formatted for display.
 *
 * @param {Object} props
 * @param {number} props.amount The loan principal.
 * @param {number} props.interestRate The annual interest rate.
 * @param {number} props.termMonths The length of the loan in months.
 * @param {number} props.monthlyPayment The calculated monthly payment.
 * @param {number} props.totalInterest The total interest paid over the loan.
 * @param {number} props.totalAmount The total amount paid including principal and interest.
 */
export function FinancialOverview({
  amount,
  interestRate,
  termMonths,
  monthlyPayment,
  totalInterest,
  totalAmount,
}) {
  const interestPercentage = amount ? (totalInterest / amount) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-cyan-100 rounded-lg">
          <TrendingUp className="w-6 h-6 text-cyan-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Panorama financiero</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-700 font-medium">Pagos mensuales</p>
          </div>
          <p className="text-2xl font-bold text-blue-900">{formatCurrency(monthlyPayment)}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700 font-medium">Monto de credito</p>
          </div>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(amount)}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-5 h-5 text-orange-600" />
            <p className="text-sm text-orange-700 font-medium">Interes Total</p>
          </div>
          <p className="text-2xl font-bold text-orange-900">{formatCurrency(totalInterest)}</p>
          <p className="text-xs text-orange-600 mt-1">{formatPercentage(interestPercentage)} del Total</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-slate-600" />
            <p className="text-sm text-slate-700 font-medium">Costo total</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalAmount)}</p>
          <p className="text-xs text-slate-600 mt-1">
            {termMonths} meses con un interes de {formatPercentage(interestRate)}
          </p>
        </div>
      </div>
    </div>
  );
}