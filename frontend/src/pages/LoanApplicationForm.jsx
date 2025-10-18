import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Camera,
  Upload,
  User,
  Mail,
  Phone,
  Briefcase,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import {
  extractTextFromImage,
  parsePassportData,
} from "../utils/ocrService.js";
import { formatCurrency } from "../utils/loanCalculations.js";

/**
 * Form for capturing personal information needed to submit a loan application.
 * Includes optional OCR scanning of identity documents to pre-fill the
 * identification and full name fields. On submit the application is sent
 * to the Supabase backend.
 */
export function LoanApplicationForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { amount = 50000, termMonths = 60 } = location.state || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    identification: "",
    fullName: "",
    email: "",
    phone: "",
    monthlyIncome: "",
    employmentStatus: "employed",
    dataConsent: false,
  });

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const text = await extractTextFromImage(file);
      const parsedData = parsePassportData(text);

      setFormData((prev) => ({
        ...prev,
        identification: parsedData.identification || prev.identification,
        fullName: parsedData.fullName || prev.fullName,
      }));
    } catch (error) {
      console.error("OCR Error:", error);
      alert("Failed to process image. Please enter details manually.");
    } finally {
      setIsProcessing(false);
    }
  }

  const INTEREST_RATE = 1.2;
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.dataConsent) {
      // puedes dejar este alert de validación
      alert("Debes consentir el uso de datos para continuar.");
      return;
    }

    setIsSubmitting(true); // solo para mostrar “Enviando...”
    try {
      const application = {
        applicant: {
          fullName: formData.fullName,
          identification: formData.identification,
          email: formData.email,
          phone: formData.phone,
          monthlyIncome: Number(formData.monthlyIncome),
          employmentStatus: formData.employmentStatus,
          dataConsent: formData.dataConsent,
        },
        loan: {
          amount: Number(amount),
          termMonths: Number(termMonths),
          interestRate: INTEREST_RATE,
          bankPreference: "Structura Bank",
          purpose: "Consumo",
        },
        meta: { createdAt: new Date().toISOString(), source: "form" },
      };

      localStorage.setItem("loanApplicationDraft", JSON.stringify(application));
      navigate("/contract-review", { state: { application } });
    } finally {
      // si navegas, esto casi no se ve, pero por si acaso
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Regresar al Simulador
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Solicitud de préstamo
            </h1>
            <p className="text-gray-600">
              Completa el formulario para solicitar tu credito
            </p>
          </div>

          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="font-semibold text-blue-900 mb-2">
              Detalles del credito
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-700">Cantidad solicitada</p>
                <p className="text-lg font-bold text-blue-900">
                  {formatCurrency(amount)}
                </p>
              </div>
              <div>
                <p className="text-blue-700">Plazo</p>
                <p className="text-lg font-bold text-blue-900">
                  {termMonths} meses
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Escanea Passport/RUT (Opcional)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Carga la foto de tu pasaporte o RUT para auto completar los datos
              de identificacion
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
              >
                <Upload className="w-5 h-5" />
                {isProcessing ? "Procesando..." : "Cargar Documento"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Identificacion (RUT/DNI) *
                </div>
              </label>
              <input
                type="text"
                required
                value={formData.identification}
                onChange={(e) =>
                  setFormData({ ...formData, identification: e.target.value })
                }
                placeholder="12345678-9"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nombre Completo *
                </div>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email *
                </div>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Teléfono *
                </div>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="(+56) 9 1234 5678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Ingreso Mensual *
                </div>
              </label>
              <input
                type="number"
                required
                value={formData.monthlyIncome}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyIncome: e.target.value })
                }
                placeholder="Ej: 1200000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Estado laboral *
                </div>
              </label>
              <select
                value={formData.employmentStatus}
                onChange={(e) =>
                  setFormData({ ...formData, employmentStatus: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="employed">Empleado/a</option>
                <option value="self-employed">Independiente</option>
                <option value="unemployed">Desempleado/a</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                required
                id="consent"
                checked={formData.dataConsent}
                onChange={(e) =>
                  setFormData({ ...formData, dataConsent: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="consent" className="text-sm text-gray-700">
                Consiento el uso de mis datos para la evaluacion de crédito
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
