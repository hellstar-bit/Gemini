// frontend/src/components/planillados/PlanilladosFilters.tsx
import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarDaysIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import type { PlanilladoFiltersDto } from '../../pages/campaign/PlanilladosPage';
import planilladosService from '../../services/planilladosService';

interface PlanilladosFiltersProps {
  filters: PlanilladoFiltersDto;
  onFiltersChange: (filters: PlanilladoFiltersDto) => void;
}

export const PlanilladosFilters: React.FC<PlanilladosFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const [localFilters, setLocalFilters] = useState<PlanilladoFiltersDto>(filters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [barrios, setBarrios] = useState<string[]>([]);
  const [municipios, setMunicipios] = useState<string[]>([]);

  // Cargar listas para dropdowns
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
        console.error('Error loading filter options:', error);
      }
    };

    loadOptions();
  }, []);

  // Sincronizar filtros externos con estado local
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Detectar si hay filtros avanzados activos
  useEffect(() => {
    const hasAdvancedFilters = !!(
      localFilters.barrioVive ||
      localFilters.municipioVotacion ||
      localFilters.genero ||
      localFilters.rangoEdad ||
      localFilters.fechaDesde ||
      localFilters.fechaHasta ||
      localFilters.actualizado !== undefined
    );
    
    if (hasAdvancedFilters) {
      setShowAdvanced(true);
    }
  }, [localFilters]);

  const handleFilterChange = (key: keyof PlanilladoFiltersDto, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: PlanilladoFiltersDto = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    setShowAdvanced(false);
  };

  const getActiveFiltersCount = () => {
    return Object.values(localFilters).filter(value => 
      value !== undefined && value !== '' && value !== null
    ).length;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Filtros básicos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Búsqueda general */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar planillado
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={localFilters.buscar || ''}
              onChange={(e) => handleFilterChange('buscar', e.target.value)}
              placeholder="Cédula, nombres, apellidos o celular..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={localFilters.estado || ''}
            onChange={(e) => handleFilterChange('estado', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todos los estados</option>
            <option value="verificado">Verificados</option>
            <option value="pendiente">Pendientes</option>
          </select>
        </div>

        {/* Es Edil */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo
          </label>
          <select
            value={localFilters.esEdil === true ? 'true' : localFilters.esEdil === false ? 'false' : ''}
            onChange={(e) => handleFilterChange('esEdil', e.target.value === '' ? undefined : e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todos</option>
            <option value="true">Solo Ediles</option>
            <option value="false">Solo Votantes</option>
          </select>
        </div>
      </div>

      {/* Toggle filtros avanzados */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FunnelIcon className="w-4 h-4 mr-2" />
          Filtros avanzados
          {getActiveFiltersCount() > 0 && (
            <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </button>

        {getActiveFiltersCount() > 0 && (
          <button
            onClick={handleClearFilters}
            className="flex items-center text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            <XMarkIcon className="w-4 h-4 mr-1" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {/* Barrio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1" />
                Barrio
              </label>
              <select
                value={localFilters.barrioVive || ''}
                onChange={(e) => handleFilterChange('barrioVive', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos los barrios</option>
                {barrios.map(barrio => (
                  <option key={barrio} value={barrio}>{barrio}</option>
                ))}
              </select>
            </div>

            {/* Municipio de votación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Municipio votación
              </label>
              <select
                value={localFilters.municipioVotacion || ''}
                onChange={(e) => handleFilterChange('municipioVotacion', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos los municipios</option>
                {municipios.map(municipio => (
                  <option key={municipio} value={municipio}>{municipio}</option>
                ))}
              </select>
            </div>

            {/* Género */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Género
              </label>
              <select
                value={localFilters.genero || ''}
                onChange={(e) => handleFilterChange('genero', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos los géneros</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* Rango de edad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rango de edad
              </label>
              <select
                value={localFilters.rangoEdad || ''}
                onChange={(e) => handleFilterChange('rangoEdad', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas las edades</option>
                <option value="18-24">18-24 años</option>
                <option value="25-34">25-34 años</option>
                <option value="35-44">35-44 años</option>
                <option value="45-54">45-54 años</option>
                <option value="55-64">55-64 años</option>
                <option value="65+">65+ años</option>
              </select>
            </div>
          </div>

          {/* Filtros de fecha */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <CalendarDaysIcon className="w-4 h-4 mr-1" />
                Fecha desde
              </label>
              <input
                type="date"
                value={localFilters.fechaDesde ? new Date(localFilters.fechaDesde).toISOString().split('T')[0] : ''}
                onChange={(e) => handleFilterChange('fechaDesde', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha hasta
              </label>
              <input
                type="date"
                value={localFilters.fechaHasta ? new Date(localFilters.fechaHasta).toISOString().split('T')[0] : ''}
                onChange={(e) => handleFilterChange('fechaHasta', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de actualización
              </label>
              <select
                value={localFilters.actualizado === true ? 'true' : localFilters.actualizado === false ? 'false' : ''}
                onChange={(e) => handleFilterChange('actualizado', e.target.value === '' ? undefined : e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos</option>
                <option value="true">Actualizados</option>
                <option value="false">No actualizados</option>
              </select>
            </div>
          </div>

          {/* Resumen de filtros activos */}
          {getActiveFiltersCount() > 0 && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
              <p className="text-sm text-primary-700 font-medium mb-2">
                Filtros activos ({getActiveFiltersCount()}):
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(localFilters).map(([key, value]) => {
                  if (value === undefined || value === '' || value === null) return null;
                  
                  let displayValue = String(value);
                  let displayKey = key;

                  // Formatear nombres de campos
                  const fieldNames: Record<string, string> = {
                    buscar: 'Búsqueda',
                    estado: 'Estado',
                    barrioVive: 'Barrio',
                    municipioVotacion: 'Municipio',
                    genero: 'Género',
                    rangoEdad: 'Edad',
                    esEdil: 'Tipo',
                    actualizado: 'Actualización',
                    fechaDesde: 'Desde',
                    fechaHasta: 'Hasta'
                  };

                  displayKey = fieldNames[key] || key;

                  // Formatear valores especiales
                  if (key === 'esEdil') {
                    displayValue = value ? 'Ediles' : 'Votantes';
                  } else if (key === 'actualizado') {
                    displayValue = value ? 'Actualizados' : 'No actualizados';
                  } else if (key === 'fechaDesde' || key === 'fechaHasta') {
                    displayValue = new Date(value as Date).toLocaleDateString('es-CO');
                  }

                  return (
                    <span
                      key={key}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {displayKey}: {displayValue}
                      <button
                        onClick={() => handleFilterChange(key as keyof PlanilladoFiltersDto, undefined)}
                        className="ml-1 text-primary-600 hover:text-primary-800"
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
      )}
    </div>
  );
};