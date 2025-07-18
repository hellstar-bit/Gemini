// frontend/src/components/planillados/PlanilladoModal.tsx - MEJORADO CON DROPDOWNS DE BÚSQUEDA
import React, { useState, useEffect, useRef } from 'react';
import {
  XMarkIcon,
  UserIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon
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

// Lista completa de barrios de Barranquilla
const BARRIOS_BARRANQUILLA = [
  "20 DE JULIO", "7 DE ABRIL", "7 DE AGOSTO", "ALFONSO LOPEZ", "ALTAMIRA", "ALTO PRADO", 
  "ALTOS DE RIOMAR", "ALTOS DEL LIMON", "AMERICA", "ANDALUCIA", "ATLANTICO", "BARLOVENTO", 
  "BARRIO ABAJO", "BELLA ARENA", "BELLAVISTA", "BERNARDO HOYOS", "BETANIA", "BOSTON", 
  "BOYACA", "BUENA ESPERANZA", "BUENAVISTA", "BUENOS AIRES", "CALIFORNIA", "CAMPO ALEGRE", 
  "CARLOS MEISEL", "CARRIZAL", "CENTRO", "CEVILLAR", "CHIQUINQUIRA", "CIUDAD JARDIN", 
  "CIUDAD MODESTO", "CIUDADELA 20 DE JULIO", "CIUDADELA DE LA SALUD", "COLINA CAMPESTRE", 
  "COLOMBIA", "CORDIALIDAD", "CORREGIMIENTO JUAN MINA", "CORREGIMIENTO LA PLAYA", 
  "CUCHILLA DE VILLATE", "EL BOSQUE", "EL CAMPITO", "EL CARMEN", "EL CASTILLO", 
  "EL EDEN 2000", "EL EDEN I", "EL GOLF", "EL GOLFO", "EL LIMONCITO", "EL MILAGRO", 
  "EL POBLADO", "EL PORVENIR", "EL PRADO", "EL PUEBLO", "EL RECREO", "EL ROMANCE", 
  "EL ROSARIO", "EL RUBI", "EL SANTUARIO", "EL SILENCIO", "EL TABOR", "EL VALLE", 
  "EVARISTO SOURDIS", "GRANADILLO", "INDUSTRIAL NORTE", "INDUSTRIAL VIA 40", 
  "JOSE ANTONIO GALAN", "KALAMARY", "KENNEDY", "LA ALBORAYA", "LA CAMPIÑA", "LA CEIBA", 
  "LA CHINITA", "LA CONCEPCION", "LA CUMBRE", "LA ESMERALDA", "LA FLORESTA", "LA FLORIDA", 
  "LA GLORIA", "LA LIBERTAD", "LA LUZ", "LA MAGDALENA", "LA MANGA", "LA PAZ", "LA PRADERA", 
  "LA SIERRA", "LA SIERRITA", "LA UNION", "LA VICTORIA", "LAS AMERICAS", "LAS CAYENAS", 
  "LAS COLINAS", "LAS DELICIAS", "LAS DUNAS", "LAS ESTRELLAS", "LAS FLORES", "LAS GARDENIAS", 
  "LAS GRANJAS", "LAS MALVINAS", "LAS MERCEDES", "LAS NIEVES", "LAS PALMAS", "LAS PALMERAS", 
  "LAS TERRAZAS", "LAS TRES AVE MARIAS", "LIMON", "LIPAYA", "LOMA FRESCA", "LOS ALPES", 
  "LOS ANDES", "LOS ANGELES I", "LOS ANGELES II", "LOS ANGELES III", "LOS CONTINENTES", 
  "LOS GIRASOLES", "LOS JOBOS", "LOS LAURELES", "LOS NOGALES", "LOS OLIVOS I", "LOS OLIVOS II", 
  "LOS PINOS", "LOS ROSALES", "LOS TRUPILLOS", "LUCERO", "ME QUEJO", "MERCEDES SUR", 
  "MIRAMAR", "MODELO", "MONTECRISTO", "MONTES", "NUEVA COLOMBIA", "NUEVA GRANADA", 
  "NUEVO HORIZONTE", "OLAYA", "PALMAS DEL RIO", "PARAISO", "PASADENA", "PASEO DE LA CASTELLANA", 
  "POR FIN", "PRIMERO DE MAYO", "PUMAREJO", "REBOLO", "RIOMAR", "SAN FELIPE", "SAN FRANCISCO", 
  "SAN ISIDRO", "SAN JOSE", "SAN LUIS", "SAN MARINO", "SAN NICOLAS", "SAN PEDRO", 
  "SAN PEDRO ALEJANDRINO", "SAN ROQUE", "SAN SALVADOR", "SAN VICENTE", "SANTA ANA", 
  "SANTA HELENA", "SANTA MARIA", "SANTA MONICA", "SANTO DOMINGO DE GUZMAN", "SANTODOMINGO", 
  "SIAPE", "SIMON BOLIVAR", "SOLAIRE NORTE", "TAYRONA", "UNIVERSAL", "VILLA BLANCA", 
  "VILLA CAROLINA", "VILLA COUNTRY", "VILLA DEL CARMEN", "VILLA DEL ESTE", "VILLA DEL ROSARIO", 
  "VILLA FLOR", "VILLA SAN CARLOS", "VILLA SAN CARLOS II", "VILLA SAN PEDRO II", "VILLA SANTOS", 
  "VILLA SEVILLA", "VILLANUEVA", "VILLAS DE SAN PABLO", "VILLATE", "ZONA FRANCA"
];

const MUNICIPIOS_VOTACION = ["Barranquilla", "Otro"];

// Componente de Dropdown con búsqueda
interface SearchableDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  searchPlaceholder: string;
  disabled?: boolean;
  error?: boolean;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  disabled = false,
  error = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 text-left border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex items-center justify-between ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value || placeholder}
        </span>
        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Campo de búsqueda */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Lista de opciones */}
          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm ${
                    value === option ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                  }`}
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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

  const isEditing = !!planillado;

  // Inicializar formulario con datos del planillado
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

  // Validación en tiempo real para cédula
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

  // Validación completa del formulario
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay muy sutil - apenas perceptible */}
      <div 
        className="absolute inset-0 bg-gray-900 bg-opacity-10 backdrop-blur-[2px]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
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
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
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
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-180px)]">
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
                  <SearchableDropdown
                    value={formData.barrioVive}
                    onChange={(value) => handleInputChange('barrioVive', value)}
                    options={BARRIOS_BARRANQUILLA}
                    placeholder="Seleccionar barrio"
                    searchPlaceholder="Buscar barrio..."
                    disabled={isLoading}
                  />
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
                  <SearchableDropdown
                    value={formData.municipioVotacion}
                    onChange={(value) => handleInputChange('municipioVotacion', value)}
                    options={MUNICIPIOS_VOTACION}
                    placeholder="Seleccionar municipio"
                    searchPlaceholder="Buscar municipio..."
                    disabled={isLoading}
                  />
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