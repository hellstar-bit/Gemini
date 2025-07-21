// frontend/src/pages/campaign/CandidatesPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  IdentificationIcon,
  ChartBarIcon,
  PlusIcon,
  ExclamationCircleIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

import { CandidatesList } from '../../components/candidates/CandidatesList';
import { CandidatesFilters } from '../../components/candidates/CandidatesFilters';
import { CandidatesStats } from '../../components/candidates/CandidatesStats';
import { CandidatesCharts } from '../../components/candidates/CandidatesCharts';
import { CandidateModal } from '../../components/candidates/CandidateModal';
import candidatesService, { type Candidate, type CandidateFiltersDto, type CandidateStatsDto } from '../../services/candidatesService';

export const CandidatesPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'charts'>('list');
  const [filters, setFilters] = useState<CandidateFiltersDto>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [stats, setStats] = useState<CandidateStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const statsData = await candidatesService.getStats(filters);
      setStats(statsData);
    } catch (error: any) {
      console.error('Error loading stats:', error);
      setError('Error al cargar estadísticas');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleCreateCandidate = () => {
    setEditingCandidate(null);
    setShowModal(true);
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCandidate(null);
    loadStats(); // Recargar estadísticas
  };

  const handleExport = async () => {
    try {
      setIsLoading(true);
      await candidatesService.exportToExcel(filters);
    } catch (error) {
      console.error('Error exporting:', error);
      setError('Error al exportar datos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <IdentificationIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Candidatos</h1>
                <p className="text-sm text-gray-600">
                  Gestión completa de candidatos y perfiles electorales
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filtros
              </button>

              <button
                onClick={handleExport}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Exportar
              </button>

              <button
                onClick={handleCreateCandidate}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo Candidato
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        {showFilters && (
          <div className="mb-6">
            <CandidatesFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClear={() => setFilters({})}
            />
          </div>
        )}

        {/* Estadísticas */}
        {stats && (
          <div className="mb-6">
            <CandidatesStats stats={stats} isLoading={isLoading} />
          </div>
        )}

        {/* Navegación de vistas */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setView('list')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  view === 'list'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IdentificationIcon className="h-5 w-5 inline mr-2" />
                Lista de Candidatos
              </button>
              <button
                onClick={() => setView('charts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  view === 'charts'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ChartBarIcon className="h-5 w-5 inline mr-2" />
                Análisis y Gráficos
              </button>
            </nav>
          </div>
        </div>

        {/* Contenido principal */}
        {view === 'list' && (
          <CandidatesList
            filters={filters}
            onEditCandidate={handleEditCandidate}
            selectedIds={selectedIds}
            onSelectedIdsChange={setSelectedIds}
          />
        )}

        {view === 'charts' && stats && (
          <CandidatesCharts stats={stats} filters={filters} />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <CandidateModal
          candidate={editingCandidate}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};