// LoanApplicationForm.jsx (solo lo que cambia)
import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, Upload, User, Mail, Phone, Briefcase, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase.js';

// ⬇️ CAMBIO: importar nuevas utilidades
import { extractTextFromImage, parseCedulaChile, formatRut, validateRut } from '../utils/ocrService.js';
import { formatCurrency } from '../utils/loanCalculations.js';

export function LoanApplicationForm() {
  // ... (tu estado y hooks iguales)

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // ⬇️ OCR mejorado con spa y psm 6
      const ocrResult = await extractTextFromImage(file, { lang: 'spa', psm: 6 });
      const { rut, fullName, confidence } = parseCedulaChile(ocrResult);

      setFormData((prev) => ({
        ...prev,
        identification: rut ? formatRut(rut) : prev.identification,
        fullName: fullName || prev.fullName,
      }));

      // (opcional) avisar si la confianza es baja
      if (confidence && confidence < 60) {
        console.warn('OCR con confianza baja:', Math.round(confidence));
      }

      // (opcional) validar RUT y avisar
      if (rut && !validateRut(rut)) {
        alert('Revisa el RUT detectado — parece inválido. Corrígelo si es necesario.');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      alert('No se pudo procesar la imagen. Ingresa los datos manualmente.');
    } finally {
      setIsProcessing(false);
    }
  }

  // ⬇️ Formateo/validación en tiempo real del RUT
  function handleRutChange(e) {
    const value = e.target.value.toUpperCase();
    // quitar caracteres raros aparte de dígitos, K/k, guión y puntos
    const sane = value.replace(/[^0-9Kk\.\-]/g, '');
    setFormData((prev) => ({ ...prev, identification: formatRut(sane) }));
  }

  // ... en el JSX, solo cambia el input del RUT y el input file:
  // 1) Input file con capture="environment" (mejor en móvil)
  // 2) Input RUT usando handleRutChange

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      {/* ... */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Escanea Passport/RUT (Opcional)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Carga la foto de tu pasaporte o RUT para autocompletar los datos de identificación
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            <Upload className="w-5 h-5" />
            {isProcessing ? 'Procesando...' : 'Cargar Documento'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"         {/* ⬅️ ayuda en móviles */}
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* RUT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Identificación (RUT/DNI) *
            </div>
          </label>
          <input
            type="text"
            required
            value={formData.identification}
            onChange={handleRutChange}       {/* ⬅️ cambia aquí */}
            placeholder="12.345.678-9"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {/* (opcional) feedback de validación */}
          {formData.identification && !validateRut(formData.identification) && (
            <p className="text-xs text-red-600 mt-1">RUT inválido, por favor revisa.</p>
          )}
        </div>

        {/* Nombre */}
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
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Juan Pérez"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* ... el resto igual */}
      </form>
      {/* ... */}
    </div>
  );
}
