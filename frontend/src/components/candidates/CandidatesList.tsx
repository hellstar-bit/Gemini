// frontend/src/components/candidates/CandidatesList.tsx - CORRECCIÓN
import React, { useState, useEffect } from 'react';
import {
  PencilIcon,
  TrashIcon,
  IdentificationIcon,
  UserGroupIcon,
  UsersIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import candidatesService, { type Candidate, type CandidateFiltersDto } from '../../services/candidatesService';

interface CandidatesListProps {
  filters: CandidateFiltersDto;
  onEditCandidate: (candidate: Candidate) => void;
  selectedIds: number[];
  onSelectedIdsChange: (ids: number[]) => void;
  refreshTrigger?: number; // ✅ NUEVO PROP para forzar refresh
}

export const CandidatesList: React.FC<CandidatesListProps> = ({
  filters,
  onEditCandidate,
  selectedIds,
  onSelectedIdsChange,
  refreshTrigger = 0, // ✅ NUEVO PROP
}) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const loadCandidates = async (page = 1) => {
    setLoading(true);
    try {
      const response = await candidatesService.getAll(filters, page, pagination.limit);
      setCandidates(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading candidates:', error);
      // Fallback a datos vacíos en caso de error
      setCandidates([]);
      setPagination({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Efecto para filtros
  useEffect(() => {
    loadCandidates(1);
  }, [filters]);

  // ✅ NUEVO: Efecto para refreshTrigger
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadCandidates(pagination.page);
    }
  }, [refreshTrigger]);

  const handlePageChange = (page: number) => {
    loadCandidates(page);
  };

  const handleDelete = async (candidate: Candidate) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el candidato "${candidate.name}"?`)) {
      try {
        await candidatesService.delete(candidate.id);
        loadCandidates(pagination.page);
        // También limpiar de selectedIds si estaba seleccionado
        onSelectedIdsChange(selectedIds.filter(id => id !== candidate.id));
      } catch (error) {
        console.error('Error deleting candidate:', error);
        alert('Error al eliminar el candidato');
      }
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedIdsChange(candidates.map(c => c.id));
    } else {
      onSelectedIdsChange([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      onSelectedIdsChange([...selectedIds, id]);
    } else {
      onSelectedIdsChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  // Componente de estado del candidato
  const CandidateStatus: React.FC<{ candidate: Candidate }> = ({ candidate }) => (
    <div className="flex flex-wrap gap-1">
      {candidate.isActive ? (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Activo
        </span>
      ) : (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircleIcon className="w-3 h-3 mr-1" />
          Inactivo
        </span>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verificar si todos los candidatos de la página actual están seleccionados
  const currentPageIds = candidates.map(candidate => candidate.id);
  const allCurrentPageSelected = currentPageIds.length > 0 && 
    currentPageIds.every(id => selectedIds.includes(id));
  const someCurrentPageSelected = currentPageIds.some(id => selectedIds.includes(id));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Lista de Candidatos
            </h3>
            <p className="text-sm text-gray-600">
              {pagination.total} candidato{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
          
          {selectedIds.length > 0 && (
            <div className="text-sm text-primary-600 font-medium">
              {selectedIds.length} seleccionado{selectedIds.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={allCurrentPageSelected}
                  ref={input => {
                    if (input) input.indeterminate = someCurrentPageSelected && !allCurrentPageSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posición/Partido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Meta / Actual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estructura
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {candidates.map((candidate) => {
              const cumplimiento = candidate.meta > 0 ? 
                Math.round((candidate.votersCount || 0) / candidate.meta * 100) : 0;

              return (
                <tr
                  key={candidate.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedIds.includes(candidate.id) ? 'bg-primary-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(candidate.id)}
                      onChange={(e) => handleSelectOne(candidate.id, e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <IdentificationIcon className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {candidate.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {candidate.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {candidate.position || 'Sin especificar'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {candidate.party || 'Sin partido'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {candidate.email && (
                        <div className="flex items-center text-sm text-gray-900">
                          <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                          {candidate.email}
                        </div>
                      )}
                      {candidate.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                          {candidate.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {(candidate.votersCount || 0).toLocaleString()} / {candidate.meta.toLocaleString()}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            cumplimiento >= 80 ? 'bg-green-500' :
                            cumplimiento >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(cumplimiento, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {cumplimiento}% cumplimiento
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <UserGroupIcon className="w-4 h-4 mr-1 text-gray-400" />
                        {candidate.groupsCount || 0} grupos
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="w-4 h-4 mr-1 text-gray-400" />
                        {candidate.leadersCount || 0} líderes
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <CandidateStatus candidate={candidate} />
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onEditCandidate(candidate)}
                        className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50"
                        title="Editar candidato"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(candidate)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Eliminar candidato"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} a{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
              {pagination.total} resultados
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              <span className="text-sm text-gray-700">
                Página {pagination.page} de {pagination.pages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};