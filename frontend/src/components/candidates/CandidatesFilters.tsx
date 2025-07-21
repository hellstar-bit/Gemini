// frontend/src/components/candidates/CandidatesFilters.tsx
import React from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { CandidateFiltersDto } from '../../services/candidatesService';

interface CandidatesFiltersProps {
  filters: CandidateFiltersDto;
  onFiltersChange: (filters: CandidateFiltersDto) => void;
  onClear: () => void;
}

export const CandidatesFilters: React.FC<CandidatesFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    onFiltersChange({
      ...filters,
      [name]: value === '' ? undefined : newValue,
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFiltersChange({
      ...filters,
      [name]: value ? new Date(value) : undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  const commonPositions = [
    'Alcalde',
    'Concejal',
    'Diputado',
    'Gobernador',
    'Edil',
    'Senador',
    'Representante',
  ];

  const commonParties = [
    'Centro Democrático',
    'Partido Liberal',
    'Partido Conservador',
    'Cambio Radical',
    'Polo Democrático',
    'Partido Verde',
    'MAIS',
    'ASI',
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <div className="relative">
            <input
              type="text"
              name="buscar"
              value={filters.buscar || ''}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nombre, email, posición..."
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Posición
          </label>
          <select
            name="position"
            value={filters.position || ''}
            onChange={handleChange}
            className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todas las posiciones</option>
            {commonPositions.map(position => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Partido
          </label>
          <select
            name="party"
            value={filters.party || ''}
            onChange={handleChange}
            className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todos los partidos</option>
            {commonParties.map(party => (
              <option key={party} value={party}>
                {party}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            name="isActive"
            value={filters.isActive === undefined ? '' : filters.isActive.toString()}
            onChange={handleChange}
            className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha desde
          </label>
          <input
            type="date"
            name="fechaDesde"
            value={filters.fechaDesde ? filters.fechaDesde.toISOString().split('T')[0] : ''}
            onChange={handleDateChange}
            className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha hasta
          </label>
          <input
            type="date"
            name="fechaHasta"
            value={filters.fechaHasta ? filters.fechaHasta.toISOString().split('T')[0] : ''}
            onChange={handleDateChange}
            className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>
    </div>
  );
};