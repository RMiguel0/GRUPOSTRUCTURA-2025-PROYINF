import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoanSimulator } from "./pages/LoanSimulator.jsx";
import { LoanApplicationForm } from "./pages/LoanApplicationForm.jsx";
import ContractReview from "./pages/ContractReview.jsx";
import IdentityCheck from "./pages/IdentityCheck.jsx";
import BciTestPage from "./pages/BciTestPage.jsx"; // 👈 nuevo

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoanSimulator />} />
        <Route path="/apply" element={<LoanApplicationForm />} />
        <Route path="/identity-check" element={<IdentityCheck />} />
        <Route path="/contract-review" element={<ContractReview />} />
        <Route path="/bci-test" element={<BciTestPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
