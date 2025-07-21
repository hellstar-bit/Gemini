// frontend/src/components/leaders/LeadersFilters.tsx
import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import type { LeaderFiltersDto } from '../../pages/campaign/LeadersPage';

interface LeadersFiltersProps {
  filters: LeaderFiltersDto;
  onFiltersChange: (filters: LeaderFiltersDto) => void;
}

export const LeadersFilters: React.FC<LeadersFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<LeaderFiltersDto>(filters);

  // Opciones de filtros
  const neighborhoods = [
    'Centro', 'Norte', 'Sur', 'Este', 'Oeste', 'La Candelaria', 
    'Chapinero', 'Usaquén', 'Suba', 'Engativá', 'Fontibón'
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

  // Actualizar filtros locales cuando cambien los externos
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Aplicar filtros
  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsExpanded(false);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    const emptyFilters: LeaderFiltersDto = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  // Actualizar filtro individual
  const updateFilter = (key: keyof LeaderFiltersDto, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  // Contar filtros activos
  const activeFiltersCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof LeaderFiltersDto];
    return value !== undefined && value !== null && value !== '';
  }).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header de filtros */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, cédula, teléfono..."
                value={localFilters.buscar || ''}
                onChange={(e) => updateFilter('buscar', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`inline-flex items-center px-4 py-2 rounded-lg border font-medium transition-colors ${
                isExpanded 
                  ? 'bg-primary-50 border-primary-200 text-primary-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filtros Avanzados
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <XMarkIcon className="w-4 h-4 mr-1" />
                Limpiar
              </button>
            )}
            
            <button
              onClick={handleApplyFilters}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>

      {/* Filtros expandidos */}
      {isExpanded && (
        <div className="px-6 py-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Estado del líder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                Estado
              </label>
              <select
                value={localFilters.isActive?.toString() || ''}
                onChange={(e) => updateFilter('isActive', e.target.value ? e.target.value === 'true' : undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>

            {/* Verificación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ShieldCheckIcon className="w-4 h-4 inline mr-1" />
                Verificación
              </label>
              <select
                value={localFilters.isVerified?.toString() || ''}
                onChange={(e) => updateFilter('isVerified', e.target.value ? e.target.value === 'true' : undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="true">Verificados</option>
                <option value="false">No Verificados</option>
              </select>
            </div>

            {/* Barrio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPinIcon className="w-4 h-4 inline mr-1" />
                Barrio
              </label>
              <select
                value={localFilters.neighborhood || ''}
                onChange={(e) => updateFilter('neighborhood', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todos los barrios</option>
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
                <MapPinIcon className="w-4 h-4 inline mr-1" />
                Municipio
              </label>
              <select
                value={localFilters.municipality || ''}
                onChange={(e) => updateFilter('municipality', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todos los municipios</option>
                {municipalities.map(municipality => (
                  <option key={municipality} value={municipality}>
                    {municipality}
                  </option>
                ))}
              </select>
            </div>

            {/* Género */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserGroupIcon className="w-4 h-4 inline mr-1" />
                Género
              </label>
              <select
                value={localFilters.gender || ''}
                onChange={(e) => updateFilter('gender', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                {genderOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ID Grupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserGroupIcon className="w-4 h-4 inline mr-1" />
                ID Grupo
              </label>
              <input
                type="number"
                placeholder="ID del grupo"
                value={localFilters.groupId || ''}
                onChange={(e) => updateFilter('groupId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Fecha desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                Fecha Desde
              </label>
              <input
                type="date"
                value={localFilters.fechaDesde ? localFilters.fechaDesde.toISOString().split('T')[0] : ''}
                onChange={(e) => updateFilter('fechaDesde', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Fecha hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                Fecha Hasta
              </label>
              <input
                type="date"
                value={localFilters.fechaHasta ? localFilters.fechaHasta.toISOString().split('T')[0] : ''}
                onChange={(e) => updateFilter('fechaHasta', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filtros activos (chips) */}
      {activeFiltersCount > 0 && (
        <div className="px-6 py-3 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (value === undefined || value === null || value === '') return null;
              
              let displayValue = value.toString();
              let displayKey = key;

              // Personalizar la visualización
              switch (key) {
                case 'buscar':
                  displayKey = 'Búsqueda';
                  break;
                case 'isActive':
                  displayKey = 'Estado';
                  displayValue = value ? 'Activo' : 'Inactivo';
                  break;
                case 'isVerified':
                  displayKey = 'Verificado';
                  displayValue = value ? 'Sí' : 'No';
                  break;
                case 'groupId':
                  displayKey = 'Grupo';
                  break;
                case 'neighborhood':
                  displayKey = 'Barrio';
                  break;
                case 'municipality':
                  displayKey = 'Municipio';
                  break;
                case 'gender':
                  displayKey = 'Género';
                  displayValue = genderOptions.find(g => g.value === value)?.label || value.toString();
                  break;
                case 'fechaDesde':
                  displayKey = 'Desde';
                  displayValue = new Date(value as Date).toLocaleDateString();
                  break;
                case 'fechaHasta':
                  displayKey = 'Hasta';
                  displayValue = new Date(value as Date).toLocaleDateString();
                  break;
              }

              return (
                <span
                  key={key}
                  className="inline-flex items-center bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                >
                  <strong className="mr-1">{displayKey}:</strong>
                  {displayValue}
                  <button
                    onClick={() => updateFilter(key as keyof LeaderFiltersDto, undefined)}
                    className="ml-1 hover:bg-primary-200 rounded-full p-0.5"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};