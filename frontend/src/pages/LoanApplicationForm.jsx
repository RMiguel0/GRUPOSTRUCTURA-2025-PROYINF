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
import { supabase } from "../lib/supabase.js";
import { extractTextFromImage } from "../utils/ocrService.js";
import { formatCurrency } from "../utils/loanCalculations.js";

/**
 * Form para capturar datos y (opcional) escanear documento.
 * Se guarda la imagen del documento para validación facial en /identity-check
 * antes de ContractReview.
 */
export function LoanApplicationForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { amount = 50000, termMonths = 60 } = location.state || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ⬇️ guardamos el archivo del documento para IdentityCheck
  const [docImageFile, setDocImageFile] = useState(null);

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

    setDocImageFile(file); // para la comparación facial

    // ➜ respaldo: guarda un dataURL en sessionStorage (por si el File se pierde al navegar)
    try {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          sessionStorage.setItem("idDocDataURL", reader.result);
        } catch {}
      };
      reader.readAsDataURL(file);
    } catch {}

    setIsProcessing(true);
    try {
      // Backend OCR: retorna { identification, fullName, rawText }
      const data = await extractTextFromImage(file);

      setFormData((prev) => ({
        ...prev,
        identification: data.identification || prev.identification,
        fullName: data.fullName || prev.fullName,
      }));

      console.log("✅ OCR resultado:", data);
    } catch (error) {
      console.error("❌ OCR Error:", error);
      alert("No se pudo procesar la imagen. Ingrese los datos manualmente.");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.dataConsent) {
      alert("Please consent to the use of your data to continue.");
      return;
    }

    setIsSubmitting(true);
    try {
      await supabase.from("loan_applications").insert([
        {
          identification: formData.identification,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          monthly_income: parseFloat(formData.monthlyIncome),
          employment_status: formData.employmentStatus,
          requested_amount: amount,
          requested_term_months: termMonths,
          data_consent: formData.dataConsent,
        },
      ]);

      alert("¡Solicitud enviada exitosamente!");
    } catch (err) {
      console.error("Error al insertar:", err);
      alert("Hubo un error al enviar la solicitud, pero continuaremos.");
    } finally {
      // → Datos que usarán IdentityCheck y luego ContractReview
      const application = {
        applicant: {
          fullName: formData.fullName,
          identification: formData.identification,
          email: formData.email,
          phone: formData.phone,
        },
        loan: {
          amount,
          termMonths,
          interestRate:
            (location.state && location.state.interestRate) ?? undefined,
          bankPreference:
            (location.state && location.state.bankPreference) ?? undefined,
          purpose: (location.state && location.state.purpose) ?? undefined,
        },
        meta: { createdAt: new Date().toISOString(), source: "apply-form" },
      };

      // ⬇️ pasamos por IdentityCheck y enviamos File + dataURL (respaldo)
      const dataURL = sessionStorage.getItem("idDocDataURL") || null;

      navigate("/identity-check", {
        state: { application, idImageFile: docImageFile || null, idImageDataURL: dataURL },
      });
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Regresar al Simulador
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Solicitud de préstamo
            </h1>
            <p className="text-gray-600">
              Completa el formulario para solicitar tu crédito
            </p>
          </div>

          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="font-semibold text-blue-900 mb-2">
              Detalles del crédito
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

          {/* OCR / subida de documento */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5" /> Escanea Passport/RUT (Opcional)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Carga la foto de tu pasaporte o RUT para auto completar los datos
              de identificación
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

          {/* Formulario principal (igual que antes) */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" /> Identificación (RUT/DNI) *
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
                  <User className="w-4 h-4" /> Nombre Completo *
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
                  <Mail className="w-4 h-4" /> Email *
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
                  <Phone className="w-4 h-4" /> Teléfono *
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
                  <Briefcase className="w-4 h-4" /> Ingreso Mensual *
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
                  <Briefcase className="w-4 h-4" /> Estado laboral *
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
                id="consent"
                checked={formData.dataConsent}
                onChange={(e) =>
                  setFormData({ ...formData, dataConsent: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="consent" className="text-sm text-gray-700">
                Consiento el uso de mis datos para la evaluación de crédito
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
