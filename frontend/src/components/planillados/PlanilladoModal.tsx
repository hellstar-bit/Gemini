// frontend/src/components/planillados/PlanilladoModal.tsx - INTEGRADO CON API REAL
import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  UserIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import type { Planillado } from '../../pages/campaign/PlanilladosPage';
import planilladosService from '../../services/planilladosService';

interface PlanilladoModalProps {
  planillado?: Planillado | null;
  onClose: () => void;
  onSave: (data: Partial<Planillado>) => void;
  isLoading?: boolean;
}

interface FormData {
  cedula: string;
  nombres: string;
  apellidos: string;
  celular: string;
  direccion: string;
  barrioVive: string;
  fechaExpedicion: string;
  municipioVotacion: string;
  direccionVotacion: string;
  zonaPuesto: string;
  mesa: string;
  esEdil: boolean;
  fechaNacimiento: string;
  genero: 'M' | 'F' | 'Otro' | '';
  notas: string;
}

interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: any;
}

export const PlanilladoModal: React.FC<PlanilladoModalProps> = ({
  planillado,
  onClose,
  onSave,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<FormData>({
    cedula: '',
    nombres: '',
    apellidos: '',
    celular: '',
    direccion: '',
    barrioVive: '',
    fechaExpedicion: '',
    municipioVotacion: 'Barranquilla',
    direccionVotacion: '',
    zonaPuesto: '',
    mesa: '',
    esEdil: false,
    fechaNacimiento: '',
    genero: '',
    notas: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validation, setValidation] = useState<ValidationState | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [barrios, setBarrios] = useState<string[]>([]);
  const [municipios, setMunicipios] = useState<string[]>([]);

  const isEditing = !!planillado;

  // ✅ Cargar listas para selectores
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [barriosData, municipiosData] = await Promise.all([
          planilladosService.getBarrios(),
          planilladosService.getMunicipios()
        ]);
        setBarrios(barriosData);
        setMunicipios(municipiosData);
      } catch (error) {
        console.error('Error loading options:', error);
        // Fallback data
        setBarrios([
          'El Prado', 'Riomar', 'Alto Prado', 'Las Flores', 'La Concepción',
          'Boston', 'Villa Country', 'El Golf', 'Villa Santos', 'La Victoria'
        ]);
        setMunicipios(['Barranquilla', 'Soledad', 'Malambo', 'Puerto Colombia']);
      }
    };

    loadOptions();
  }, []);

  // ✅ Inicializar formulario con datos del planillado
  useEffect(() => {
    if (planillado) {
      setFormData({
        cedula: planillado.cedula || '',
        nombres: planillado.nombres || '',
        apellidos: planillado.apellidos || '',
        celular: planillado.celular || '',
        direccion: planillado.direccion || '',
        barrioVive: planillado.barrioVive || '',
        fechaExpedicion: planillado.fechaExpedicion ? 
          new Date(planillado.fechaExpedicion).toISOString().split('T')[0] : '',
        municipioVotacion: planillado.municipioVotacion || 'Barranquilla',
        direccionVotacion: planillado.direccionVotacion || '',
        zonaPuesto: planillado.zonaPuesto || '',
        mesa: planillado.mesa || '',
        esEdil: planillado.esEdil || false,
        fechaNacimiento: planillado.fechaNacimiento ? 
          new Date(planillado.fechaNacimiento).toISOString().split('T')[0] : '',
        genero: planillado.genero || '',
        notas: planillado.notas || ''
      });
    }
  }, [planillado]);

  // ✅ Validación en tiempo real para cédula
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (formData.cedula && formData.cedula.length >= 8) {
      timeoutId = setTimeout(async () => {
        if (!isEditing || formData.cedula !== planillado?.cedula) {
          try {
            const duplicateCheck = await planilladosService.checkDuplicates(formData.cedula);
            if (duplicateCheck.exists) {
              setErrors(prev => ({
                ...prev,
                cedula: `Ya existe un planillado con esta cédula (${duplicateCheck.planillado?.nombres} ${duplicateCheck.planillado?.apellidos})`
              }));
            } else {
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.cedula;
                return newErrors;
              });
            }
          } catch (error) {
            console.error('Error checking duplicates:', error);
          }
        }
      }, 500);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [formData.cedula, isEditing, planillado?.cedula]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error cuando el usuario corrige
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // ✅ Validación completa del formulario
  const validateForm = async (): Promise<boolean> => {
    setIsValidating(true);
    const newErrors: Record<string, string> = {};

    try {
      // Validación usando la API
      const validationResult = await planilladosService.validate({
        cedula: formData.cedula,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        celular: formData.celular || undefined,
        fechaNacimiento: formData.fechaNacimiento ? new Date(formData.fechaNacimiento) : undefined,
        barrioVive: formData.barrioVive || undefined,
        municipioVotacion: formData.municipioVotacion || undefined,
      });

      setValidation(validationResult);

      // Mapear errores de validación
      validationResult.errors.forEach(error => {
        if (error.includes('cédula')) {
          newErrors.cedula = error;
        } else if (error.includes('nombres')) {
          newErrors.nombres = error;
        } else if (error.includes('apellidos')) {
          newErrors.apellidos = error;
        } else if (error.includes('celular')) {
          newErrors.celular = error;
        } else if (error.includes('edad') || error.includes('nacimiento')) {
          newErrors.fechaNacimiento = error;
        }
      });

      // Validaciones adicionales locales
      if (!formData.cedula.trim()) {
        newErrors.cedula = 'La cédula es requerida';
      }

      if (!formData.nombres.trim()) {
        newErrors.nombres = 'Los nombres son requeridos';
      }

      if (!formData.apellidos.trim()) {
        newErrors.apellidos = 'Los apellidos son requeridos';
      }

    } catch (error) {
      console.error('Error validating form:', error);
      // Fallback a validación local básica
      if (!formData.cedula.trim()) newErrors.cedula = 'La cédula es requerida';
      if (!formData.nombres.trim()) newErrors.nombres = 'Los nombres son requeridos';
      if (!formData.apellidos.trim()) newErrors.apellidos = 'Los apellidos son requeridos';
    } finally {
      setIsValidating(false);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    // Preparar datos para enviar
    const dataToSave: Partial<Planillado> = {
      cedula: formData.cedula,
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      celular: formData.celular || undefined,
      direccion: formData.direccion || undefined,
      barrioVive: formData.barrioVive || undefined,
      fechaExpedicion: formData.fechaExpedicion ? new Date(formData.fechaExpedicion) : undefined,
      municipioVotacion: formData.municipioVotacion || undefined,
      direccionVotacion: formData.direccionVotacion || undefined,
      zonaPuesto: formData.zonaPuesto || undefined,
      mesa: formData.mesa || undefined,
      esEdil: formData.esEdil,
      fechaNacimiento: formData.fechaNacimiento ? new Date(formData.fechaNacimiento) : undefined,
      genero: formData.genero || undefined,
      notas: formData.notas || undefined,
    };

    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Editar Planillado' : 'Nuevo Planillado'}
              </h2>
              <p className="text-sm text-gray-600">
                {isEditing ? 'Modifica la información del planillado' : 'Completa los datos del nuevo planillado'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Validation warnings/suggestions */}
        {validation && (validation.warnings.length > 0 || Object.keys(validation.suggestions).length > 0) && (
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            {validation.warnings.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center text-blue-800 text-sm font-medium mb-1">
                  <InformationCircleIcon className="w-4 h-4 mr-1" />
                  Advertencias:
                </div>
                <ul className="text-blue-700 text-sm space-y-1 ml-5">
                  {validation.warnings.map((warning, index) => (
                    <li key={index} className="list-disc">{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {Object.keys(validation.suggestions).length > 0 && (
              <div>
                <div className="flex items-center text-blue-800 text-sm font-medium mb-1">
                  <InformationCircleIcon className="w-4 h-4 mr-1" />
                  Sugerencias:
                </div>
                <div className="text-blue-700 text-sm space-y-1">
                  {validation.suggestions.municipioVotacion && (
                    <p>Municipio sugerido: <strong>{validation.suggestions.municipioVotacion}</strong></p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            
            {/* Información Personal */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-gray-500" />
                Información Personal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cédula *
                  </label>
                  <input
                    type="text"
                    value={formData.cedula}
                    onChange={(e) => handleInputChange('cedula', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.cedula ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="12345678"
                    disabled={isLoading}
                  />
                  {errors.cedula && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                      {errors.cedula}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    value={formData.nombres}
                    onChange={(e) => handleInputChange('nombres', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.nombres ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Juan Carlos"
                    disabled={isLoading}
                  />
                  {errors.nombres && (
                    <p className="mt-1 text-sm text-red-600">{errors.nombres}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    value={formData.apellidos}
                    onChange={(e) => handleInputChange('apellidos', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.apellidos ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Pérez García"
                    disabled={isLoading}
                  />
                  {errors.apellidos && (
                    <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Celular
                  </label>
                  <input
                    type="text"
                    value={formData.celular}
                    onChange={(e) => handleInputChange('celular', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.celular ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="3001234567"
                    disabled={isLoading}
                  />
                  {errors.celular && (
                    <p className="mt-1 text-sm text-red-600">{errors.celular}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.fechaNacimiento ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  />
                  {errors.fechaNacimiento && (
                    <p className="mt-1 text-sm text-red-600">{errors.fechaNacimiento}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Género
                  </label>
                  <select
                    value={formData.genero}
                    onChange={(e) => handleInputChange('genero', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={isLoading}
                  >
                    <option value="">Seleccionar género</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Información de Residencia */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="w-5 h-5 mr-2 text-gray-500" />
                Información de Residencia
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Calle 123 #45-67"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barrio donde vive
                  </label>
                  <select
                    value={formData.barrioVive}
                    onChange={(e) => handleInputChange('barrioVive', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={isLoading}
                  >
                    <option value="">Seleccionar barrio</option>
                    {barrios.map(barrio => (
                      <option key={barrio} value={barrio}>{barrio}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Expedición Cédula
                  </label>
                  <input
                    type="date"
                    value={formData.fechaExpedicion}
                    onChange={(e) => handleInputChange('fechaExpedicion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Información Electoral */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CalendarDaysIcon className="w-5 h-5 mr-2 text-gray-500" />
                Información Electoral
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Municipio de Votación
                  </label>
                  <select
                    value={formData.municipioVotacion}
                    onChange={(e) => handleInputChange('municipioVotacion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={isLoading}
                  >
                    {municipios.map(municipio => (
                      <option key={municipio} value={municipio}>{municipio}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección de Votación
                  </label>
                  <input
                    type="text"
                    value={formData.direccionVotacion}
                    onChange={(e) => handleInputChange('direccionVotacion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Colegio San José"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona/Puesto
                  </label>
                  <input
                    type="text"
                    value={formData.zonaPuesto}
                    onChange={(e) => handleInputChange('zonaPuesto', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Zona 1"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mesa
                  </label>
                  <input
                    type="text"
                    value={formData.mesa}
                    onChange={(e) => handleInputChange('mesa', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="001"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Checkbox Es Edil */}
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.esEdil}
                    onChange={(e) => handleInputChange('esEdil', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Es candidato a edil
                  </span>
                </label>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas adicionales
              </label>
              <textarea
                value={formData.notas}
                onChange={(e) => handleInputChange('notas', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Información adicional sobre el planillado..."
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Los campos marcados con * son obligatorios
              {isValidating && (
                <span className="ml-2 text-primary-600">
                  Validando...
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || isValidating}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  isLoading || isValidating
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    {isEditing ? 'Actualizar' : 'Guardar'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};