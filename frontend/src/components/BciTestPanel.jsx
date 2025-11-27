// frontend/src/components/BciTestPanel.jsx
import { useState } from 'react'

export default function BciTestPanel() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleTest = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/loans/bci-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // futuro: mandar parámetros
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ ok: false, error: String(err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #444' }}>
      <h2>Prueba API BCI (simulate)</h2>
      <button onClick={handleTest} disabled={loading}>
        {loading ? 'Llamando a BCI...' : 'Probar /api/loans/bci-test'}
      </button>

      {result && (
        <pre style={{ marginTop: '1rem', maxHeight: 300, overflow: 'auto', fontSize: 12 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </section>
  )
}
