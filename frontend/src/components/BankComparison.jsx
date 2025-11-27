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
 * @param {Object|null} props.bciData Simulación proveniente del BCI (mock o real)
 */
export function BankComparison({ amount, termMonths, currentRate, bankRates, bciData }) {
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

  const banksCount = bankRates?.length ?? 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-100 rounded-lg">
          <Building2 className="w-6 h-6 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Comparación de bancos</h2>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        {banksCount > 0 ? (
          <p className="text-sm text-blue-800">
            Comparando ofertas de {banksCount} banco
            {banksCount === 1 ? '' : 's'} para un préstamo de {formatCurrency(amount)} a {termMonths}{' '}
            meses.
          </p>
        ) : (
          <p className="text-sm text-blue-800">
            Por ahora no hay otras ofertas bancarias para comparar. Mostrando solo la comparación con
            BCI.
          </p>
        )}
      </div>

      {/* ⭐⭐⭐ BLOQUE BCI (siempre visible) ⭐⭐⭐ */}
      <div className="mb-6 p-5 rounded-lg border-2 bg-purple-50 border-purple-300 hover:border-purple-400 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-purple-800">Comparación con Banco Bci</h3>
            <p className="text-sm text-purple-600">
              Resultados basados en la simulación recibida desde la API de BCI.
            </p>
          </div>
        </div>

        {bciData ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-purple-600 mb-1">Cuota mensual</p>
                <p className="text-lg font-bold text-purple-800">
                  {formatCurrency(bciData.monthlyInstallment)}
                </p>
              </div>

              <div>
                <p className="text-xs text-purple-600 mb-1">Costo total</p>
                <p className="text-lg font-bold text-purple-800">
                  {formatCurrency(bciData.totalCost)}
                </p>
              </div>

              <div>
                <p className="text-xs text-purple-600 mb-1">CAE</p>
                <p className="text-lg font-bold text-purple-800">
                  {formatPercentage(bciData.cae)}
                </p>
              </div>

              <div>
                <p className="text-xs text-purple-600 mb-1">Monto</p>
                <p className="text-lg font-bold text-purple-800">
                  {formatCurrency(bciData.amount)}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs text-purple-600">
              Plazo simulado: {bciData.termMonths} meses.
            </p>
          </>
        ) : (
          <div className="p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-700 font-semibold">
              No se pudo obtener la simulación desde BCI.
            </p>
            <p className="text-xs text-red-600 mt-1">
              Es posible que la API de BCI esté temporalmente fuera de servicio o no disponible para esta
              aplicación. Se muestran solo los datos de tu simulación interna y otros bancos.
            </p>
          </div>
        )}
      </div>
      {/* FIN BLOQUE BCI */}

      {/* ⭐⭐⭐ BLOQUES DE OTROS BANCOS ⭐⭐⭐ */}
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
                <p className="text-lg font-bold text-gray-800">
                  {formatPercentage(bank.avg_rate)}
                </p>
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
