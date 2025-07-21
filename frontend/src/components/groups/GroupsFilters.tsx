// frontend/src/components/groups/GroupsFilters.tsx
import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import candidatesService, { type Candidate } from '../../services/candidatesService';
import type { GroupFiltersDto } from '../../services/groupsService';

interface GroupsFiltersProps {
  filters: GroupFiltersDto;
  onFiltersChange: (filters: GroupFiltersDto) => void;
  onClear: () => void;
}

export const GroupsFilters: React.FC<GroupsFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear,
}) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);

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

  // Zonas comunes para grupos
  const commonZones = [
    'Norte',
    'Sur', 
    'Centro',
    'Oriente',
    'Occidente',
    'Metropolitana',
    'Rural',
    'Urbana'
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
              placeholder="Nombre, descripción..."
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Candidato
          </label>
          <select
            name="candidateId"
            value={filters.candidateId || ''}
            onChange={handleChange}
            className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todos los candidatos</option>
            {candidates.map((candidate: Candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zona
          </label>
          <select
            name="zone"
            value={filters.zone || ''}
            onChange={handleChange}
            className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todas las zonas</option>
            {commonZones.map((zone: string) => (
              <option key={zone} value={zone}>
                {zone}
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
            Con Líderes
          </label>
          <select
            name="conLideres"
            value={filters.conLideres === undefined ? '' : filters.conLideres.toString()}
            onChange={handleChange}
            className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todos</option>
            <option value="true">Con líderes asignados</option>
            <option value="false">Sin líderes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Con Planillados
          </label>
          <select
            name="conPlanillados"
            value={filters.conPlanillados === undefined ? '' : filters.conPlanillados.toString()}
            onChange={handleChange}
            className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todos</option>
            <option value="true">Con planillados</option>
            <option value="false">Sin planillados</option>
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