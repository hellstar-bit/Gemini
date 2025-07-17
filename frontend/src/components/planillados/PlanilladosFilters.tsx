// frontend/src/components/planillados/PlanilladosFilters.tsx
import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  MapPinIcon,
  UserIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import type { PlanilladoFiltersDto } from '../../pages/campaign/PlanilladosPage';

interface PlanilladosFiltersProps {
  filters: PlanilladoFiltersDto;
  onFiltersChange: (filters: PlanilladoFiltersDto) => void;
}

export const PlanilladosFilters: React.FC<PlanilladosFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.buscar || '');

  // Datos mock para los selectores
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

  const rangosEdad = [
    '18-24', '25-34', '35-44', '45-54', '55-64', '65+'
  ];

  const handleFilterChange = (key: keyof PlanilladoFiltersDto, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value === '' ? undefined : value
    };
    onFiltersChange(newFilters);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange('buscar', searchTerm);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== '' && value !== null
    ).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Barra principal de filtros */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Búsqueda */}
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por cédula, nombre, apellido..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </form>

          {/* Filtros rápidos */}
          <div className="flex items-center gap-3">
            {/* Estado */}
            <select
              value={filters.estado || ''}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos los estados</option>
              <option value="verificado">Verificados</option>
              <option value="pendiente">Pendientes</option>
            </select>

            {/* Barrio */}
            <select
              value={filters.barrioVive || ''}
              onChange={(e) => handleFilterChange('barrioVive', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos los barrios</option>
              {barrios.map(barrio => (
                <option key={barrio} value={barrio}>{barrio}</option>
              ))}
            </select>

            {/* Tipo */}
            <select
              value={filters.esEdil?.toString() || ''}
              onChange={(e) => handleFilterChange('esEdil', e.target.value === 'true')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todos</option>
              <option value="true">Solo Ediles</option>
              <option value="false">Solo Planillados</option>
            </select>

            {/* Botón filtros avanzados */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center px-3 py-2 border rounded-lg transition-colors ${
                showAdvanced || activeFiltersCount > 0
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
              Avanzado
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-primary-500 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Limpiar filtros */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Limpiar todos los filtros"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Líder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <UserIcon className="w-4 h-4 inline mr-1" />
                Líder Asignado
              </label>
              <select
                value={filters.liderId || ''}
                onChange={(e) => handleFilterChange('liderId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos los líderes</option>
                {lideres.map(lider => (
                  <option key={lider.id} value={lider.id}>{lider.nombre}</option>
                ))}
              </select>
            </div>

            {/* Grupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <UserIcon className="w-4 h-4 inline mr-1" />
                Grupo
              </label>
              <select
                value={filters.grupoId || ''}
                onChange={(e) => handleFilterChange('grupoId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos los grupos</option>
                {grupos.map(grupo => (
                  <option key={grupo.id} value={grupo.id}>{grupo.nombre}</option>
                ))}
              </select>
            </div>

            {/* Género */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Género
              </label>
              <select
                value={filters.genero || ''}
                onChange={(e) => handleFilterChange('genero', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* Rango de Edad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rango de Edad
              </label>
              <select
                value={filters.rangoEdad || ''}
                onChange={(e) => handleFilterChange('rangoEdad', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas las edades</option>
                {rangosEdad.map(rango => (
                  <option key={rango} value={rango}>{rango} años</option>
                ))}
              </select>
            </div>

            {/* Municipio de Votación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPinIcon className="w-4 h-4 inline mr-1" />
                Municipio de Votación
              </label>
              <select
                value={filters.municipioVotacion || ''}
                onChange={(e) => handleFilterChange('municipioVotacion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos</option>
                {municipios.map(municipio => (
                  <option key={municipio} value={municipio}>{municipio}</option>
                ))}
              </select>
            </div>

            {/* Estado de Actualización */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado de Datos
              </label>
              <select
                value={filters.actualizado?.toString() || ''}
                onChange={(e) => handleFilterChange('actualizado', e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos</option>
                <option value="true">Actualizados</option>
                <option value="false">Desactualizados</option>
              </select>
            </div>

            {/* Fecha Desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                Desde
              </label>
              <input
                type="date"
                value={filters.fechaDesde ? filters.fechaDesde.toISOString().split('T')[0] : ''}
                onChange={(e) => handleFilterChange('fechaDesde', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Fecha Hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                Hasta
              </label>
              <input
                type="date"
                value={filters.fechaHasta ? filters.fechaHasta.toISOString().split('T')[0] : ''}
                onChange={(e) => handleFilterChange('fechaHasta', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="p-3 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-sm text-blue-700 font-medium">Filtros activos:</span>
            {Object.entries(filters).map(([key, value]) => {
              if (value === undefined || value === '' || value === null) return null;
              
              let displayValue = String(value);
              let displayKey = key;
              
              // Personalizar nombres de campos
              const fieldNames: Record<string, string> = {
                buscar: 'Búsqueda',
                estado: 'Estado',
                barrioVive: 'Barrio',
                esEdil: 'Tipo',
                genero: 'Género',
                rangoEdad: 'Edad',
                municipioVotacion: 'Municipio',
                actualizado: 'Actualizado'
              };
              
              displayKey = fieldNames[key] || key;
              
              if (key === 'esEdil') {
                displayValue = value ? 'Ediles' : 'Planillados';
              }
              
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {displayKey}: {displayValue}
                  <button
                    onClick={() => handleFilterChange(key as keyof PlanilladoFiltersDto, undefined)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
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