// frontend/src/components/leaders/LeaderModal.tsx - OVERLAY CORREGIDO
import React, { useState } from 'react';
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  IdentificationIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import type { Leader } from '../../pages/campaign/LeadersPage';

interface LeaderModalProps {
  leader: Leader | null;
  onClose: () => void;
  onSave: (data: Partial<Leader>) => Promise<void>;
  isLoading: boolean;
}

export const LeaderModal: React.FC<LeaderModalProps> = ({
  leader,
  onClose,
  onSave,
  isLoading
}) => {
  // Estados iniciales estables
  const [formData, setFormData] = useState(() => ({
    cedula: leader?.cedula || '',
    firstName: leader?.firstName || '',
    lastName: leader?.lastName || '',
    phone: leader?.phone || '',
    email: leader?.email || '',
    address: leader?.address || '',
    neighborhood: leader?.neighborhood || '',
    municipality: leader?.municipality || '',
    birthDate: leader?.birthDate,
    gender: leader?.gender,
    meta: leader?.meta || 0,
    isActive: leader?.isActive ?? true,
    isVerified: leader?.isVerified ?? false,
    groupId: leader?.groupId || 1
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const isEditing = !!leader;

  // Opciones estáticas
  const neighborhoods = [
    'Centro', 'Norte', 'Sur', 'Este', 'Oeste', 'La Candelaria', 
    'Chapinero', 'Usaquén', 'Suba', 'Engativá', 'Fontibón',
    'Kennedy', 'Bosa', 'Ciudad Bolívar', 'San Cristóbal'
  ];

  const municipalities = [
    'Bogotá', 'Soacha', 'Chía', 'Zipaquirá', 'Facatativá', 
    'Mosquera', 'Madrid', 'Funza', 'Cajicá', 'La Calera'
  ];

  const genderOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'Other', label: 'Otro' }
  ];

  // Handler directo sin recreación
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error si existe
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validaciones
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cedula?.trim()) {
      newErrors.cedula = 'La cédula es obligatoria';
    } else if (!/^\d{8,11}$/.test(formData.cedula.trim())) {
      newErrors.cedula = 'La cédula debe tener entre 8 y 11 dígitos';
    }

    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'El nombre es obligatorio';
    }

    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'El apellido es obligatorio';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]{7,15}$/.test(formData.phone)) {
      newErrors.phone = 'El teléfono no tiene un formato válido';
    }

    if (!formData.groupId || formData.groupId < 1) {
      newErrors.groupId = 'Debe seleccionar un grupo válido';
    }

    if (formData.meta !== undefined && formData.meta < 0) {
      newErrors.meta = 'La meta no puede ser negativa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving leader:', error);
    }
  };

  // ✅ SOLUCIÓN: Estructura simplificada del modal
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay con blur */}
      <div 
  className="absolute inset-0 backdrop-blur-sm" 
  style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
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
                  {isEditing ? 'Editar Líder' : 'Crear Nuevo Líder'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isEditing 
                    ? `Modificando información de ${leader?.firstName} ${leader?.lastName}`
                    : 'Complete la información del nuevo líder'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {step === 1 ? 'Información Básica' : 
                   step === 2 ? 'Contacto y Ubicación' : 
                   'Configuración'}
                </span>
                {step < 3 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Formulario con scroll */}
        <div className="max-h-[60vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              {/* Paso 1: Información Básica */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cédula */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <IdentificationIcon className="w-4 h-4" />
                          <span className="ml-2">Cédula</span>
                          <span className="text-red-500 ml-1">*</span>
                        </div>
                      </label>
                      <input
                        type="text"
                        value={formData.cedula}
                        onChange={(e) => handleInputChange('cedula', e.target.value)}
                        placeholder="Número de cédula"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.cedula ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.cedula && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                          {errors.cedula}
                        </p>
                      )}
                    </div>

                    {/* Género */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4" />
                          <span className="ml-2">Género</span>
                        </div>
                      </label>
                      <select
                        value={formData.gender || ''}
                        onChange={(e) => handleInputChange('gender', e.target.value || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar género</option>
                        {genderOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Nombre */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4" />
                          <span className="ml-2">Nombre</span>
                          <span className="text-red-500 ml-1">*</span>
                        </div>
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Nombre del líder"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.firstName ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    {/* Apellido */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <UserIcon className="w-4 h-4" />
                          <span className="ml-2">Apellido</span>
                          <span className="text-red-500 ml-1">*</span>
                        </div>
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Apellido del líder"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.lastName ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                          {errors.lastName}
                        </p>
                      )}
                    </div>

                    {/* Fecha de Nacimiento */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4" />
                          <span className="ml-2">Fecha de Nacimiento</span>
                        </div>
                      </label>
                      <input
                        type="date"
                        value={formData.birthDate ? 
                          (formData.birthDate instanceof Date ? 
                            (formData.birthDate as Date).toISOString().split('T')[0] : // If it's a Date object
                            new Date(formData.birthDate).toISOString().split('T')[0]
                          ) : ''
                        }
                        onChange={(e) => handleInputChange('birthDate', e.target.value ? new Date(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Paso 2: Contacto y Ubicación */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Teléfono */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <PhoneIcon className="w-4 h-4" />
                          <span className="ml-2">Teléfono</span>
                        </div>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Número de teléfono"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <EnvelopeIcon className="w-4 h-4" />
                          <span className="ml-2">Email</span>
                        </div>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Correo electrónico"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Barrio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <MapPinIcon className="w-4 h-4" />
                          <span className="ml-2">Barrio</span>
                        </div>
                      </label>
                      <select
                        value={formData.neighborhood || ''}
                        onChange={(e) => handleInputChange('neighborhood', e.target.value || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar barrio</option>
                        {neighborhoods.map(neighborhood => (
                          <option key={neighborhood} value={neighborhood}>
                            {neighborhood}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Municipio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <MapPinIcon className="w-4 h-4" />
                          <span className="ml-2">Municipio</span>
                        </div>
                      </label>
                      <select
                        value={formData.municipality || ''}
                        onChange={(e) => handleInputChange('municipality', e.target.value || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar municipio</option>
                        {municipalities.map(municipality => (
                          <option key={municipality} value={municipality}>
                            {municipality}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dirección */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4" />
                        <span className="ml-2">Dirección</span>
                      </div>
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Dirección completa"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Paso 3: Configuración */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ID del Grupo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <UserGroupIcon className="w-4 h-4" />
                          <span className="ml-2">ID del Grupo</span>
                          <span className="text-red-500 ml-1">*</span>
                        </div>
                      </label>
                      <input
                        type="number"
                        value={formData.groupId}
                        onChange={(e) => handleInputChange('groupId', parseInt(e.target.value) || 1)}
                        placeholder="Número del grupo"
                        min="1"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.groupId ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.groupId && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                          {errors.groupId}
                        </p>
                      )}
                    </div>

                    {/* Meta de Votantes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center">
                          <UserGroupIcon className="w-4 h-4" />
                          <span className="ml-2">Meta de Votantes</span>
                        </div>
                      </label>
                      <input
                        type="number"
                        value={formData.meta}
                        onChange={(e) => handleInputChange('meta', parseInt(e.target.value) || 0)}
                        placeholder="Número de votantes objetivo"
                        min="0"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.meta ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.meta && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                          {errors.meta}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Switches de estado */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Líder Activo</p>
                          <p className="text-xs text-gray-500">El líder está participando activamente</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => handleInputChange('isActive', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <ShieldCheckIcon className="w-5 h-5 text-yellow-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Líder Verificado</p>
                          <p className="text-xs text-gray-500">La información ha sido verificada</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isVerified}
                          onChange={(e) => handleInputChange('isVerified', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                      </label>
                    </div>
                  </div>

                  {/* Resumen */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Resumen del Líder</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nombre completo:</span>
                        <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cédula:</span>
                        <span className="font-medium">{formData.cedula}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ubicación:</span>
                        <span className="font-medium">
                          {formData.neighborhood && formData.municipality 
                            ? `${formData.neighborhood}, ${formData.municipality}`
                            : formData.neighborhood || formData.municipality || 'No especificada'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Grupo:</span>
                        <span className="font-medium">ID: {formData.groupId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Meta:</span>
                        <span className="font-medium">{formData.meta} votantes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <div className="flex space-x-2">
                          {formData.isActive && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Activo
                            </span>
                          )}
                          {formData.isVerified && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              Verificado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer con botones */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={isLoading}
                  className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  ← Anterior
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isLoading
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </div>
                  ) : (
                    isEditing ? 'Actualizar Líder' : 'Crear Líder'
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