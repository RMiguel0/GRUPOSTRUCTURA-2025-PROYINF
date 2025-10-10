import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { supabase } from './lib/supabase.js'
import LoanForm from './components/LoanForm.jsx'
import FinancialOverview from './components/FinancialOverview.jsx'
import SimulationHistory from './components/SimulationHistory.jsx'
import BankComparison from './components/BankComparison.jsx'

export default function App() {
  const [currentCalculation, setCurrentCalculation] = useState({
    amount: 50000, interestRate: 5.5, termMonths: 60,
    monthlyPayment: 0, totalInterest: 0, totalAmount: 0,
  })
  const [simulations, setSimulations] = useState([])
  const [bankRates, setBankRates] = useState([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => { loadSimulations(); loadBankRates() }, [])

  async function loadSimulations() {
    const { data } = await supabase.from('loan_simulations')
      .select('*').order('created_at', { ascending: false }).limit(10)
    setSimulations(data ?? [])
  }
  async function loadBankRates() {
    const { data } = await supabase.from('bank_rates')
      .select('*').order('avg_rate', { ascending: true })
    setBankRates(data ?? [])
  }
  async function saveSimulation() {
    setIsSaving(true)
    await supabase.from('loan_simulations').insert([{
      amount: currentCalculation.amount,
      interest_rate: currentCalculation.interestRate,
      term_months: currentCalculation.termMonths,
      monthly_payment: currentCalculation.monthlyPayment,
      total_interest: currentCalculation.totalInterest,
      total_amount: currentCalculation.totalAmount,
    }])
    await loadSimulations()
    setIsSaving(false)
  }
  async function deleteSimulation(id) {
    await supabase.from('loan_simulations').delete().eq('id', id)
    await loadSimulations()
  }

  return (
    <div className="min-h-screen">
      <header className="text-center pt-10 pb-6">
        <h1 className="text-4xl font-extrabold tracking-tight">Simulador de credito</h1>
        <p className="text-gray-600 mt-2">
          Compara tasas, calcula pagos y encuentra la mejor oferta
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <LoanForm onCalculate={setCurrentCalculation} />
          </div>

          <aside className="space-y-6">
            <FinancialOverview
              amount={currentCalculation.amount}
              totalInterest={currentCalculation.totalInterest}
              totalAmount={currentCalculation.totalAmount}
              interestRate={currentCalculation.interestRate}
              termMonths={currentCalculation.termMonths}
            />

            <button
              onClick={saveSimulation}
              disabled={isSaving}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg shadow-soft transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Simulation'}
            </button>
          </aside>
        </div>

        <section className="mb-6">
          <SimulationHistory
            simulations={simulations}
            onDelete={(s) => deleteSimulation(s.id)}
          />
        </section>

        <BankComparison
          amount={currentCalculation.amount}
          termMonths={currentCalculation.termMonths}
          currentRate={currentCalculation.interestRate}
          bankRates={bankRates}
        />
      </main>
    </div>
  )
}
