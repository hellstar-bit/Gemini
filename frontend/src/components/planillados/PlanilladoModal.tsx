// frontend/src/components/planillados/PlanilladoModal.tsx
import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  UserIcon,
  MapPinIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import type { Planillado } from '../../pages/campaign/PlanilladosPage';

interface PlanilladoModalProps {
  planillado?: Planillado | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const PlanilladoModal: React.FC<PlanilladoModalProps> = ({
  planillado,
  onClose,
  onSave
}) => {
  const [currentTab, setCurrentTab] = useState('personal');
  const [formData, setFormData] = useState({
    // Datos personales
    cedula: '',
    nombres: '',
    apellidos: '',
    celular: '',
    direccion: '',
    barrioVive: '',
    fechaExpedicion: '',
    fechaNacimiento: '',
    genero: '',
    
    // Datos de votación
    departamentoVotacion: 'Atlántico',
    municipioVotacion: 'Barranquilla',
    direccionVotacion: '',
    zonaPuesto: '',
    mesa: '',
    
    // Estado y clasificación
    estado: 'pendiente' as 'verificado' | 'pendiente',
    esEdil: false,
    actualizado: true,
    liderId: '',
    grupoId: '',
    notas: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Mock data para selectores
  const barrios = [
    'El Prado', 'Riomar', 'Alto Prado', 'Las Flores', 'La Concepción',
    'Ciudad Jardín', 'Granadillo', 'Villa Country', 'Villa Santos',
    'El Golf', 'Buenavista', 'Modelo', 'Betania', 'San Salvador'
  ];

  const lideres = [
    { id: 1, nombre: 'Carlos Rodríguez' },
    { id: 2, nombre: 'Ana González' },
    { id: 3, nombre: 'Miguel Torres' },
    { id: 4, nombre: 'Laura Martínez' },
    { id: 5, nombre: 'Pedro Sánchez' }
  ];

  const grupos = [
    { id: 1, nombre: 'Grupo Norte' },
    { id: 2, nombre: 'Grupo Centro' },
    { id: 3, nombre: 'Grupo Sur' },
    { id: 4, nombre: 'Grupo Oriente' },
    { id: 5, nombre: 'Grupo Occidente' }
  ];

  const municipios = [
    'Barranquilla', 'Soledad', 'Malambo', 'Puerto Colombia', 
    'Galapa', 'Pradera', 'Baranoa'
  ];

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
          planillado.fechaExpedicion.toISOString().split('T')[0] : '',
        fechaNacimiento: planillado.fechaNacimiento ? 
          planillado.fechaNacimiento.toISOString().split('T')[0] : '',
        genero: planillado.genero || '',
        departamentoVotacion: planillado.departamentoVotacion || 'Atlántico',
        municipioVotacion: planillado.municipioVotacion || 'Barranquilla',
        direccionVotacion: planillado.direccionVotacion || '',
        zonaPuesto: planillado.zonaPuesto || '',
        mesa: planillado.mesa || '',
        estado: planillado.estado || 'pendiente',
        esEdil: planillado.esEdil || false,
        actualizado: planillado.actualizado ?? true,
        liderId: planillado.liderId?.toString() || '',
        grupoId: planillado.grupoId?.toString() || '',
        notas: planillado.notas || ''
      });
    }
  }, [planillado]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validaciones obligatorias
    if (!formData.cedula.trim()) {
      newErrors.cedula = 'La cédula es obligatoria';
    } else if (!/^\d{7,10}$/.test(formData.cedula)) {
      newErrors.cedula = 'La cédula debe tener entre 7 y 10 dígitos';
    }

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son obligatorios';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios';
    }

    // Validaciones opcionales con formato
    if (formData.celular && !/^[0-9+\-\s()]{10,15}$/.test(formData.celular)) {
      newErrors.celular = 'Formato de celular inválido';
    }

    if (formData.mesa && !/^\d{1,3}$/.test(formData.mesa)) {
      newErrors.mesa = 'La mesa debe ser un número de 1-3 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const dataToSave = {
        ...formData,
        liderId: formData.liderId ? parseInt(formData.liderId) : undefined,
        grupoId: formData.grupoId ? parseInt(formData.grupoId) : undefined,
        fechaExpedicion: formData.fechaExpedicion ? new Date(formData.fechaExpedicion) : undefined,
        fechaNacimiento: formData.fechaNacimiento ? new Date(formData.fechaNacimiento) : undefined
      };

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular carga
      onSave(dataToSave);
    } catch (error) {
      console.error('Error guardando planillado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Datos Personales', icon: UserIcon },
    { id: 'ubicacion', label: 'Ubicación', icon: MapPinIcon },
    { id: 'votacion', label: 'Datos de Votación', icon: DocumentTextIcon },
    { id: 'adicional', label: 'Información Adicional', icon: CheckCircleIcon }
  ];

  const renderPersonalTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
          />
          {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Expedición
          </label>
          <input
            type="date"
            value={formData.fechaExpedicion}
            onChange={(e) => handleInputChange('fechaExpedicion', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
          />
          {errors.nombres && <p className="text-red-500 text-xs mt-1">{errors.nombres}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
          />
          {errors.apellidos && <p className="text-red-500 text-xs mt-1">{errors.apellidos}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Celular
          </label>
          <input
            type="tel"
            value={formData.celular}
            onChange={(e) => handleInputChange('celular', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.celular ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="3001234567"
          />
          {errors.celular && <p className="text-red-500 text-xs mt-1">{errors.celular}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Género
          </label>
          <select
            value={formData.genero}
            onChange={(e) => handleInputChange('genero', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Seleccionar</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de Nacimiento
        </label>
        <input
          type="date"
          value={formData.fechaNacimiento}
          onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
    </div>
  );

  const renderUbicacionTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dirección de Residencia
        </label>
        <textarea
          value={formData.direccion}
          onChange={(e) => handleInputChange('direccion', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Calle 123 #45-67, Apartamento 401"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Barrio donde Vive
        </label>
        <select
          value={formData.barrioVive}
          onChange={(e) => handleInputChange('barrioVive', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Seleccionar barrio</option>
          {barrios.map(barrio => (
            <option key={barrio} value={barrio}>{barrio}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderVotacionTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Departamento de Votación
          </label>
          <input
            type="text"
            value={formData.departamentoVotacion}
            onChange={(e) => handleInputChange('departamentoVotacion', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Atlántico"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Municipio de Votación
          </label>
          <select
            value={formData.municipioVotacion}
            onChange={(e) => handleInputChange('municipioVotacion', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {municipios.map(municipio => (
              <option key={municipio} value={municipio}>{municipio}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dirección de Votación
        </label>
        <input
          type="text"
          value={formData.direccionVotacion}
          onChange={(e) => handleInputChange('direccionVotacion', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Colegio San José, Calle 45 #30-15"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zona y Puesto
          </label>
          <input
            type="text"
            value={formData.zonaPuesto}
            onChange={(e) => handleInputChange('zonaPuesto', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Zona 1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mesa
          </label>
          <input
            type="text"
            value={formData.mesa}
            onChange={(e) => handleInputChange('mesa', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.mesa ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="001"
          />
          {errors.mesa && <p className="text-red-500 text-xs mt-1">{errors.mesa}</p>}
        </div>
      </div>
    </div>
  );

  const renderAdicionalTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={formData.estado}
            onChange={(e) => handleInputChange('estado', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="pendiente">Pendiente</option>
            <option value="verificado">Verificado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Líder Asignado
          </label>
          <select
            value={formData.liderId}
            onChange={(e) => handleInputChange('liderId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Sin asignar</option>
            {lideres.map(lider => (
              <option key={lider.id} value={lider.id}>{lider.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Grupo
        </label>
        <select
          value={formData.grupoId}
          onChange={(e) => handleInputChange('grupoId', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Sin grupo</option>
          {grupos.map(grupo => (
            <option key={grupo.id} value={grupo.id}>{grupo.nombre}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.esEdil}
            onChange={(e) => handleInputChange('esEdil', e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-700">Es Edil</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.actualizado}
            onChange={(e) => handleInputChange('actualizado', e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-700">Datos Actualizados</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas
        </label>
        <textarea
          value={formData.notas}
          onChange={(e) => handleInputChange('notas', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Observaciones adicionales sobre el planillado..."
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {planillado ? 'Editar Planillado' : 'Nuevo Planillado'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center py-4 border-b-2 font-medium text-sm transition-colors ${
                  currentTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentTab === 'personal' && renderPersonalTab()}
          {currentTab === 'ubicacion' && renderUbicacionTab()}
          {currentTab === 'votacion' && renderVotacionTab()}
          {currentTab === 'adicional' && renderAdicionalTab()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          
          <div className="flex items-center space-x-3">
            {currentTab !== 'adicional' && (
              <button
                onClick={() => {
                  const currentIndex = tabs.findIndex(tab => tab.id === currentTab);
                  if (currentIndex < tabs.length - 1) {
                    setCurrentTab(tabs[currentIndex + 1].id);
                  }
                }}
                className="px-6 py-2 border border-primary-300 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Siguiente
              </button>
            )}
            
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  {planillado ? 'Actualizar' : 'Crear'} Planillado
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};