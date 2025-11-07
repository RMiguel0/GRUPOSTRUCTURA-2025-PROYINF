import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoanSimulator } from "./pages/LoanSimulator.jsx";
import { LoanApplicationForm } from "./pages/LoanApplicationForm.jsx";
import ContractReview from "./pages/ContractReview.jsx";
import IdentityCheck from "./pages/IdentityCheck.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoanSimulator />} />
        <Route path="/apply" element={<LoanApplicationForm />} />
        <Route path="/identity-check" element={<IdentityCheck />} />
        <Route path="/contract-review" element={<ContractReview />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
