import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoanSimulator } from './pages/LoanSimulator.jsx';
import { LoanApplicationForm } from './pages/LoanApplicationForm.jsx';

// Root component that defines the application routing. We import the
// simulator and loan application form pages using the `.jsx` extension
// so that Vite can resolve them correctly. The router renders the
// appropriate page based on the current URL.
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoanSimulator />} />
        <Route path="/apply" element={<LoanApplicationForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;