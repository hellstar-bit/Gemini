// frontend/src/components/candidates/CandidateModal.tsx - VERSIÓN FINAL LIMPIA
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import candidatesService, { type Candidate, type CreateCandidateDto } from '../../services/candidatesService';

import { 
  IdentificationIcon,    // Para cédula/ID
  UserIcon,             // Para nombre
  EnvelopeIcon,         // Para email  
  PhoneIcon,            // Para teléfono
  TrophyIcon,           // Para meta de votos
  BuildingLibraryIcon,  // Para posición política
  FlagIcon,             // Para partido
  DocumentTextIcon,     // Para descripción
} from '@heroicons/react/24/outline';

interface CandidateModalProps {
  candidate: Candidate | null;
  onClose: () => void;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({
  candidate,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateCandidateDto>({
    name: '',
    email: '',
    phone: '',
    meta: 0,
    description: '',
    position: '',
    party: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!candidate;

  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone || '',
        meta: candidate.meta,
        description: candidate.description || '',
        position: candidate.position || '',
        party: candidate.party || '',
        isActive: candidate.isActive,
      });
    }
  }, [candidate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (formData.meta < 0) {
      newErrors.meta = 'La meta no puede ser negativa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      if (candidate) {
        await candidatesService.update(candidate.id, formData);
      } else {
        await candidatesService.create(formData);
      }
      
      onClose();
    } catch (error: any) {
      console.error('Error saving candidate:', error);
      setErrors({
        submit: error.response?.data?.message || 'Error al guardar candidato'
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ CLAVE: Función para manejar click directo del botón
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const syntheticEvent = {
      preventDefault: () => {}
    } as React.FormEvent;
    
    handleSubmit(syntheticEvent);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'meta' ? parseInt(value) || 0 : value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h4>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <IdentificationIcon className="w-4 h-4 inline mr-2 text-gray-500" />
                  Nombre *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Nombre del candidato"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <EnvelopeIcon className="w-4 h-4 inline mr-2 text-gray-500" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="email@ejemplo.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <PhoneIcon className="w-4 h-4 inline mr-2 text-gray-500" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="3001234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TrophyIcon className="w-4 h-4 inline mr-2 text-gray-500" />
                  Meta de Votos
                </label>
                <input
                  type="number"
                  name="meta"
                  value={formData.meta}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.meta ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.meta && <p className="mt-1 text-sm text-red-600">{errors.meta}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Información Política</h4>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BuildingLibraryIcon className="w-4 h-4 inline mr-2 text-gray-500" />
                    Posición
                  </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Alcalde, Concejal, Gobernador..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FlagIcon className="w-4 h-4 inline mr-2 text-gray-500" />
                  Partido Político
                </label>
                <input
                  type="text"
                  name="party"
                  value={formData.party}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Partido político"
                />
              </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                <DocumentTextIcon className="w-4 h-4 inline mr-2 text-gray-500" />
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                placeholder="Describe la propuesta y experiencia del candidato..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Configuración</h4>
            
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border">
              <h5 className="text-sm font-medium text-gray-900 mb-4">Estado del Candidato</h5>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">Candidato activo</p>
                  <p className="text-xs text-gray-500">El candidato aparecerá en las listas y reportes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border">
              <h5 className="text-sm font-medium text-gray-900 mb-4">Resumen del Candidato</h5>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre:</span>
                  <span className="font-medium">{formData.name || 'Sin especificar'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{formData.email || 'Sin especificar'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posición:</span>
                  <span className="font-medium">{formData.position || 'Sin especificar'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Partido:</span>
                  <span className="font-medium">{formData.party || 'Sin especificar'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Meta de votos:</span>
                  <span className="font-medium">{formData.meta.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`font-medium ${formData.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay sutil */}
      <div 
        className="absolute inset-0 backdrop-blur-sm" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.08)' }}
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg mr-3">
                <UserIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditing ? 'Editar Candidato' : 'Crear Nuevo Candidato'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isEditing 
                    ? `Modificando información de ${candidate?.name}`
                    : 'Complete la información del nuevo candidato'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Indicador de pasos */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <p className="text-sm text-gray-600">
              {currentStep === 1 && 'Información Básica'}
              {currentStep === 2 && 'Información Política'}
              {currentStep === 3 && 'Configuración'}
            </p>
          </div>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto max-h-[60vh]">
          <div className="px-6 py-6">
            {errors.submit && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                {errors.submit}
              </div>
            )}

            {renderStepContent()}
          </div>
        </form>

        {/* Footer con botones */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={currentStep === 1 ? onClose : prevStep}
              disabled={loading}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {currentStep === 1 ? 'Cancelar' : 'Anterior'}
            </button>

            <div className="flex space-x-3">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  type="button" // ✅ CLAVE: type="button" en lugar de "submit"
                  onClick={handleButtonClick} // ✅ CLAVE: onClick directo
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Guardando...</span>
                    </div>
                  ) : (
                    isEditing ? '✓ Actualizar Candidato' : '✓ Crear Candidato'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};