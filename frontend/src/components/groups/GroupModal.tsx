// frontend/src/components/groups/GroupModal.tsx - CORREGIDO
import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  UserGroupIcon,
  IdentificationIcon,
  UserIcon,
  MapPinIcon,
  TrophyIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import groupsService, { type Group, type CreateGroupDto } from '../../services/groupsService';
import candidatesService, { type Candidate } from '../../services/candidatesService';

interface GroupModalProps {
  group: Group | null;
  onClose: () => void;
}

export const GroupModal: React.FC<GroupModalProps> = ({ group, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateGroupDto>({
    name: '',
    description: '',
    zone: '',
    meta: 0,
    candidateId: 0,
    isActive: true,
  });
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!group;

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const response = await candidatesService.getAll({}, 1, 100);
        setCandidates(response.data);
      } catch (error) {
        console.error('Error loading candidates:', error);
      }
    };
    loadCandidates();
  }, []);

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        description: group.description || '',
        zone: group.zone || '',
        meta: group.meta,
        candidateId: group.candidateId,
        isActive: group.isActive,
      });
    }
  }, [group]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.candidateId) {
      newErrors.candidateId = 'Debe seleccionar un candidato';
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
      if (group) {
        await groupsService.update(group.id, formData);
      } else {
        await groupsService.create(formData);
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving group:', error);
      setErrors({
        submit: error.response?.data?.message || 'Error al guardar grupo'
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVA FUNCIÓN: Para manejar click directo del botón
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
              name === 'meta' || name === 'candidateId' ? parseInt(value) || 0 : value
    }));
    
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

  const getSelectedCandidate = () => {
    return candidates.find(c => c.id === formData.candidateId);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <IdentificationIcon className="w-4 h-4 inline mr-2 text-gray-500" />
                Nombre del Grupo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Nombre del grupo político"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="w-4 h-4 inline mr-2 text-gray-500" />
                Candidato Asociado *
              </label>
              <select
                name="candidateId"
                value={formData.candidateId}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  errors.candidateId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar candidato...</option>
                {candidates.map(candidate => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name} - {candidate.position || 'Sin posición'}
                  </option>
                ))}
              </select>
              {errors.candidateId && <p className="mt-1 text-sm text-red-600">{errors.candidateId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPinIcon className="w-4 h-4 inline mr-2 text-gray-500" />
                  Zona Geográfica
                </label>
                <input
                  type="text"
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Norte, Sur, Centro..."
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
            <h4 className="text-lg font-medium text-gray-900 mb-4">Descripción del Grupo</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DocumentTextIcon className="w-4 h-4 inline mr-2 text-gray-500" />
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                placeholder="Describe los objetivos, estrategias y características del grupo político..."
              />
              <p className="mt-2 text-xs text-gray-500">
                Incluye información sobre la misión, visión y actividades principales del grupo.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Configuración</h4>
            
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border">
              <h5 className="text-sm font-medium text-gray-900 mb-4">Estado del Grupo</h5>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">Grupo activo</p>
                  <p className="text-xs text-gray-500">El grupo aparecerá en las listas y reportes</p>
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
              <h5 className="text-sm font-medium text-gray-900 mb-4">Resumen del Grupo</h5>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre:</span>
                  <span className="font-medium">{formData.name || 'Sin especificar'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Candidato:</span>
                  <span className="font-medium">
                    {getSelectedCandidate()?.name || 'Sin seleccionar'}
                  </span>
                </div>
                {getSelectedCandidate()?.position && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posición:</span>
                    <span className="font-medium">{getSelectedCandidate()?.position}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Zona:</span>
                  <span className="font-medium">{formData.zone || 'Sin especificar'}</span>
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
                {formData.description && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-gray-600 text-xs">Descripción:</span>
                    <p className="text-xs text-gray-700 mt-1 line-clamp-3">
                      {formData.description}
                    </p>
                  </div>
                )}
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
                <UserGroupIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditing ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isEditing 
                    ? `Modificando información de ${group?.name}`
                    : 'Complete la información del nuevo grupo político'
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
              {currentStep === 2 && 'Descripción del Grupo'}
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
                  type="button" // ✅ CAMBIO CLAVE: De "submit" a "button"
                  onClick={handleButtonClick} // ✅ CAMBIO CLAVE: onClick directo
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Guardando...</span>
                    </div>
                  ) : (
                    isEditing ? '✓ Actualizar Grupo' : '✓ Crear Grupo'
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