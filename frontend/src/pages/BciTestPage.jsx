import BciTestPanel from '../components/BciTestPanel.jsx';

export default function BciTestPage() {
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Prueba API BCI</h1>
      <p>Esta página llama a /api/loans/bci-test en el backend.</p>
      <BciTestPanel />
    </div>
  );
}
