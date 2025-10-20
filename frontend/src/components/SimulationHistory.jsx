import { History, Trash2 } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/loanCalculations.js';

/**
 * Displays a list of saved simulations with the ability to delete
 * individual entries. If no simulations are provided a placeholder
 * message encourages the user to create their first simulation.
 *
 * @param {Object} props
 * @param {Array<Object>} props.simulations List of saved simulations.
 * @param {(id: string) => void} props.onDelete Callback invoked when deleting a simulation.
 */
export function SimulationHistory({ simulations, onDelete, onLoad }) {
  console.log('Simulaciones recibidas:', simulations);
  if (!simulations || simulations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <History className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Simulaciones guardadas</h2>
        </div>
        <p className="text-gray-500 text-center py-8">
          No hay simulaciones guardadas aún. ¡Crea tu primera simulación arriba!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <History className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Simulaciones guardadas</h2>
      </div>

      <div className="space-y-3">
        {simulations.map((sim, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Monto</p>
                <p className="font-semibold text-gray-800">{formatCurrency(sim.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tasa</p>
                <p className="font-semibold text-gray-800">
                  {formatPercentage(sim.interestRate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Plazo</p>
                <p className="font-semibold text-gray-800">
                  {sim.termMonths} meses
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Mensual</p>
                <p className="font-semibold text-gray-800">
                  {formatCurrency(sim.monthlyPayment)}
                </p>
              </div>
            </div>
            <button
              onClick={() => onDelete(index)}
              className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Eliminar simulación"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => onLoad(sim)}
              className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label="Cargar simulación"
            >
              Cargar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}