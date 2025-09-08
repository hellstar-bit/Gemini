// frontend/src/pages/campaign/CampaignHierarchyPage.tsx - CORREGIDO
import React, { useState, useEffect, useCallback } from 'react';
import {
    UsersIcon,
    IdentificationIcon,
    UserGroupIcon,
    AcademicCapIcon,
    ClipboardDocumentCheckIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    DocumentArrowDownIcon,
    ExclamationCircleIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    CheckCircleIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

// Servicios
import candidatesService from '../../services/candidatesService';
import groupsService from '../../services/groupsService';
import leadersService from '../../services/leadersService';
import planilladosService from '../../services/planilladosService';

// Tipos
interface Candidate {
    id: number;
    name: string;
    email: string;
    phone?: string;
    meta: number;
    description?: string;
    position?: string;
    party?: string;
    isActive: boolean;
    groupsCount?: number;
    leadersCount?: number;
    votersCount?: number;
}

interface Group {
    id: number;
    name: string;
    description?: string;
    zone?: string;
    meta: number;
    isActive: boolean;
    candidateId: number;
    candidate?: Candidate;
    leadersCount?: number;
    planilladosCount?: number;
}

interface Leader {
    id: number;
    cedula: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
    address?: string;
    neighborhood?: string;
    municipality?: string;
    meta: number;
    isActive: boolean;
    isVerified: boolean;
    groupId: number;
    group?: Group;
    votersCount?: number;
}

interface Planillado {
    id: number;
    cedula: string;
    nombres: string;
    apellidos: string;
    celular?: string;
    direccion?: string;
    barrioVive?: string;
    municipioVotacion?: string;
    zonaPuesto?: string;
    mesa?: string;
    estado: 'verificado' | 'pendiente';
    esEdil: boolean;
    actualizado: boolean;
    liderId?: number;
    lider?: Leader;
    grupoId?: number;
    grupo?: Group;
}

type ViewLevel = 'candidates' | 'groups' | 'leaders' | 'planillados';

interface NavigationState {
    level: ViewLevel;
    selectedCandidate?: Candidate;
    selectedGroup?: Group;
    selectedLeader?: Leader;
}

interface PaginationState {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

// ✅ FUNCIÓN HELPER PARA MANEJAR RESPUESTAS DE API
const safeApiResponse = (response: any) => {
    // Si la respuesta tiene estructura de paginación, úsala
    if (response && response.data && response.meta) {
        return {
            data: response.data || [],
            meta: {
                total: response.meta.total || 0,
                page: response.meta.page || 1,
                limit: response.meta.limit || 20,
                totalPages: response.meta.totalPages || 0,
                hasNextPage: response.meta.hasNextPage || false,
                hasPrevPage: response.meta.hasPrevPage || false
            }
        };
    }

    // Si la respuesta es directamente un array
    if (Array.isArray(response)) {
        return {
            data: response,
            meta: {
                total: response.length,
                page: 1,
                limit: response.length,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false
            }
        };
    }

    // Fallback para cualquier otra estructura
    return {
        data: [],
        meta: {
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false
        }
    };
};

// Componente de estadísticas jerárquicas (simplificado)
const HierarchyStats: React.FC<{
    level: ViewLevel;
    selectedCandidate?: Candidate;
    selectedGroup?: Group;
    selectedLeader?: Leader;
    totalItems: number;
    loading?: boolean;
}> = ({ level, selectedCandidate, selectedGroup, selectedLeader, totalItems, loading = false }) => {

    const getStatsForLevel = () => {
        switch (level) {
            case 'candidates':
                return [
                    {
                        name: 'Total Candidatos',
                        value: totalItems,
                        icon: IdentificationIcon,
                        color: 'blue'
                    }
                ];

            case 'groups':
                if (!selectedCandidate) return [];
                return [
                    {
                        name: 'Grupos del Candidato',
                        value: totalItems,
                        icon: UserGroupIcon,
                        color: 'green'
                    },
                    {
                        name: 'Líderes Totales',
                        value: selectedCandidate.leadersCount || 0,
                        icon: AcademicCapIcon,
                        color: 'purple'
                    },
                    {
                        name: 'Votantes Totales',
                        value: selectedCandidate.votersCount || 0,
                        icon: ClipboardDocumentCheckIcon,
                        color: 'primary'
                    }
                ];

            case 'leaders':
                if (!selectedGroup) return [];
                return [
                    {
                        name: 'Líderes del Grupo',
                        value: totalItems,
                        icon: AcademicCapIcon,
                        color: 'purple'
                    },
                    {
                        name: 'Planillados del Grupo',
                        value: selectedGroup.planilladosCount || 0,
                        icon: ClipboardDocumentCheckIcon,
                        color: 'primary'
                    }
                ];

            case 'planillados':
                if (!selectedLeader) return [];
                const voterProgress = selectedLeader.meta > 0
                    ? Math.round(((selectedLeader.votersCount || 0) / selectedLeader.meta) * 100)
                    : 0;

                return [
                    {
                        name: 'Planillados del Líder',
                        value: totalItems,
                        icon: ClipboardDocumentCheckIcon,
                        color: 'primary'
                    },
                    {
                        name: 'Meta del Líder',
                        value: selectedLeader.meta,
                        icon: ArrowTrendingUpIcon,
                        color: 'orange'
                    },
                    {
                        name: 'Progreso',
                        value: `${voterProgress}%`,
                        icon: ChartBarIcon,
                        color: voterProgress >= 100 ? 'green' : voterProgress >= 75 ? 'yellow' : 'red'
                    },
                    {
                        name: 'Estado',
                        value: selectedLeader.isVerified ? 'Verificado' : 'Pendiente',
                        icon: selectedLeader.isVerified ? CheckCircleIcon : ClockIcon,
                        color: selectedLeader.isVerified ? 'green' : 'yellow'
                    }
                ];

            default:
                return [];
        }
    };

    const stats = getStatsForLevel();

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="animate-pulse">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-gray-50 p-4 rounded-lg">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (stats.length === 0) return null;

    const getColorClasses = (color: string) => {
        const colorMap = {
            blue: 'text-blue-600 bg-blue-100',
            green: 'text-green-600 bg-green-100',
            purple: 'text-purple-600 bg-purple-100',
            primary: 'text-primary-600 bg-primary-100',
            orange: 'text-orange-600 bg-orange-100',
            yellow: 'text-yellow-600 bg-yellow-100',
            red: 'text-red-600 bg-red-100'
        };
        return colorMap[color as keyof typeof colorMap] || 'text-gray-600 bg-gray-100';
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Estadísticas del Nivel</h3>
                <div className="flex items-center text-sm text-gray-500">
                    <ChartBarIcon className="w-4 h-4 mr-1" />
                    Métricas clave
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${getColorClasses(stat.color)}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    {stat.name}
                                </p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const CampaignHierarchyPage: React.FC = () => {
    // Estados principales
    const [navigation, setNavigation] = useState<NavigationState>({
        level: 'candidates'
    });

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [leaders, setLeaders] = useState<Leader[]>([]);
    const [planillados, setPlanillados] = useState<Planillado[]>([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ✅ ESTADO DE PAGINACIÓN CON VALORES INICIALES SEGUROS
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
    });

    // ✅ Cargar candidatos
    const loadCandidates = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await candidatesService.getAll({
                buscar: searchTerm,
                isActive: true
            }, pagination.page, pagination.limit);

            const safeResponse = safeApiResponse(response);

            setCandidates(safeResponse.data);
            setPagination(prev => ({
                ...prev,
                total: safeResponse.meta.total,
                totalPages: safeResponse.meta.totalPages,
                hasNextPage: safeResponse.meta.hasNextPage,
                hasPrevPage: safeResponse.meta.hasPrevPage
            }));
        } catch (error: any) {
            console.error('Error loading candidates:', error);
            setError('Error al cargar candidatos');
            setCandidates([]);
            // ✅ Resetear paginación en caso de error
            setPagination(prev => ({
                ...prev,
                total: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false
            }));
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, pagination.page, pagination.limit]);

    // ✅ Cargar grupos de un candidato
    const loadGroups = useCallback(async (candidateId: number) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await groupsService.getAll({
                candidateId,
                buscar: searchTerm,
                isActive: true
            }, pagination.page, pagination.limit);

            const safeResponse = safeApiResponse(response);

            setGroups(safeResponse.data);
            setPagination(prev => ({
                ...prev,
                total: safeResponse.meta.total,
                totalPages: safeResponse.meta.totalPages,
                hasNextPage: safeResponse.meta.hasNextPage,
                hasPrevPage: safeResponse.meta.hasPrevPage
            }));
        } catch (error: any) {
            console.error('Error loading groups:', error);
            setError('Error al cargar grupos');
            setGroups([]);
            setPagination(prev => ({
                ...prev,
                total: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false
            }));
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, pagination.page, pagination.limit]);

    // ✅ Cargar líderes de un grupo
    const loadLeaders = useCallback(async (groupId: number) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await leadersService.getAll({
                groupId,
                buscar: searchTerm,
                isActive: true
            }, pagination.page, pagination.limit);

            const safeResponse = safeApiResponse(response);

            setLeaders(safeResponse.data);
            setPagination(prev => ({
                ...prev,
                total: safeResponse.meta.total,
                totalPages: safeResponse.meta.totalPages,
                hasNextPage: safeResponse.meta.hasNextPage,
                hasPrevPage: safeResponse.meta.hasPrevPage
            }));
        } catch (error: any) {
            console.error('Error loading leaders:', error);
            setError('Error al cargar líderes');
            setLeaders([]);
            setPagination(prev => ({
                ...prev,
                total: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false
            }));
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, pagination.page, pagination.limit]);

    // ✅ Cargar planillados de un líder
    const loadPlanillados = useCallback(async (leaderId: number) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await planilladosService.getAll({
                liderId: leaderId,
                buscar: searchTerm
            }, pagination.page, pagination.limit);

            const safeResponse = safeApiResponse(response);

            setPlanillados(safeResponse.data);
            setPagination(prev => ({
                ...prev,
                total: safeResponse.meta.total,
                totalPages: safeResponse.meta.totalPages,
                hasNextPage: safeResponse.meta.hasNextPage,
                hasPrevPage: safeResponse.meta.hasPrevPage
            }));
        } catch (error: any) {
            console.error('Error loading planillados:', error);
            setError('Error al cargar planillados');
            setPlanillados([]);
            setPagination(prev => ({
                ...prev,
                total: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false
            }));
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, pagination.page, pagination.limit]);

    // Manejadores de navegación
    const handleSelectCandidate = (candidate: Candidate) => {
        setNavigation({
            level: 'groups',
            selectedCandidate: candidate
        });
        resetPagination();
    };

    const handleSelectGroup = (group: Group) => {
        setNavigation(prev => ({
            ...prev,
            level: 'leaders',
            selectedGroup: group
        }));
        resetPagination();
    };

    const handleSelectLeader = (leader: Leader) => {
        setNavigation(prev => ({
            ...prev,
            level: 'planillados',
            selectedLeader: leader
        }));
        resetPagination();
    };

    // Navegación hacia atrás
    const handleGoBack = (targetLevel: ViewLevel) => {
        const newNavigation: NavigationState = { level: targetLevel };

        if (targetLevel === 'groups' && navigation.selectedCandidate) {
            newNavigation.selectedCandidate = navigation.selectedCandidate;
        } else if (targetLevel === 'leaders' && navigation.selectedGroup) {
            newNavigation.selectedCandidate = navigation.selectedCandidate;
            newNavigation.selectedGroup = navigation.selectedGroup;
        }

        setNavigation(newNavigation);
        resetPagination();
    };

    // Reset de paginación y filtros
    const resetPagination = () => {
        setPagination({
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false
        });
        setSearchTerm('');
        setError(null);
    };

    // Manejar cambios en búsqueda
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Manejar exportación básica
    const handleExport = async () => {
        try {
            setIsLoading(true);
            console.log('Exportando datos del nivel:', navigation.level);
            alert('Función de exportación en desarrollo');
        } catch (error: any) {
            console.error('Error exporting:', error);
            setError('Error al exportar datos');
        } finally {
            setIsLoading(false);
        }
    };

    // Efectos para cargar datos según el nivel de navegación
    useEffect(() => {
        const loadData = async () => {
            switch (navigation.level) {
                case 'candidates':
                    await loadCandidates();
                    break;
                case 'groups':
                    if (navigation.selectedCandidate) {
                        await loadGroups(navigation.selectedCandidate.id);
                    }
                    break;
                case 'leaders':
                    if (navigation.selectedGroup) {
                        await loadLeaders(navigation.selectedGroup.id);
                    }
                    break;
                case 'planillados':
                    if (navigation.selectedLeader) {
                        await loadPlanillados(navigation.selectedLeader.id);
                    }
                    break;
            }
        };

        loadData();
    }, [navigation, loadCandidates, loadGroups, loadLeaders, loadPlanillados]);

    // Configuración de vista según el nivel
    const getViewConfig = () => {
        switch (navigation.level) {
            case 'candidates':
                return {
                    title: 'Candidatos',
                    icon: IdentificationIcon,
                    data: candidates,
                    emptyMessage: 'No hay candidatos registrados',
                    color: 'blue'
                };
            case 'groups':
                return {
                    title: `Grupos de ${navigation.selectedCandidate?.name}`,
                    icon: UserGroupIcon,
                    data: groups,
                    emptyMessage: 'No hay grupos asignados a este candidato',
                    color: 'green'
                };
            case 'leaders':
                return {
                    title: `Líderes del grupo ${navigation.selectedGroup?.name}`,
                    icon: AcademicCapIcon,
                    data: leaders,
                    emptyMessage: 'No hay líderes asignados a este grupo',
                    color: 'purple'
                };
            case 'planillados':
                return {
                    title: `Planillados de ${navigation.selectedLeader?.firstName} ${navigation.selectedLeader?.lastName}`,
                    icon: ClipboardDocumentCheckIcon,
                    data: planillados,
                    emptyMessage: 'No hay planillados asignados a este líder',
                    color: 'primary'
                };
        }
    };

    const viewConfig = getViewConfig();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <UsersIcon className="w-8 h-8 text-primary-600 mr-3" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Vista Jerárquica de Campaña</h1>
                                <p className="text-sm text-gray-600">Navegación completa por la estructura electoral</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleExport}
                                disabled={isLoading}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                                Exportar
                            </button>

                            <button
                                onClick={() => window.location.reload()}
                                disabled={isLoading}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                <ArrowPathIcon className="w-4 h-4 mr-2" />
                                Actualizar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Breadcrumbs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex py-3" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1 md:space-x-3">
                            <li className="inline-flex items-center">
                                <button
                                    onClick={() => handleGoBack('candidates')}
                                    className={`inline-flex items-center text-sm font-medium ${navigation.level === 'candidates'
                                            ? 'text-primary-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <IdentificationIcon className="w-4 h-4 mr-2" />
                                    Candidatos
                                </button>
                            </li>

                            {navigation.selectedCandidate && (
                                <li>
                                    <div className="flex items-center">
                                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                                        <button
                                            onClick={() => handleGoBack('groups')}
                                            className={`ml-1 text-sm font-medium ${navigation.level === 'groups'
                                                    ? 'text-primary-600'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {navigation.selectedCandidate.name}
                                        </button>
                                    </div>
                                </li>
                            )}

                            {navigation.selectedGroup && (
                                <li>
                                    <div className="flex items-center">
                                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                                        <button
                                            onClick={() => handleGoBack('leaders')}
                                            className={`ml-1 text-sm font-medium ${navigation.level === 'leaders'
                                                    ? 'text-primary-600'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            {navigation.selectedGroup.name}
                                        </button>
                                    </div>
                                </li>
                            )}

                            {navigation.selectedLeader && (
                                <li>
                                    <div className="flex items-center">
                                        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                                        <span className="ml-1 text-sm font-medium text-primary-600">
                                            {navigation.selectedLeader.firstName} {navigation.selectedLeader.lastName}
                                        </span>
                                    </div>
                                </li>
                            )}
                        </ol>
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Estadísticas jerárquicas */}
                <HierarchyStats
                    level={navigation.level}
                    selectedCandidate={navigation.selectedCandidate}
                    selectedGroup={navigation.selectedGroup}
                    selectedLeader={navigation.selectedLeader}
                    totalItems={pagination.total || 0} // ✅ Valor seguro
                    loading={isLoading}
                />

                {/* Search and Filters */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                        <viewConfig.icon className="w-6 h-6 text-gray-600" />
                        <h2 className="text-lg font-medium text-gray-900">{viewConfig.title}</h2>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {pagination.total || 0} total {/* ✅ Valor seguro */}
                        </span>
                    </div>

                    <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="Buscar..."
                            />
                        </div>

                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            <FunnelIcon className="w-4 h-4 mr-2" />
                            Filtros
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center py-12">
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            <span className="ml-3 text-gray-600">Cargando...</span>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <div className="text-sm text-red-600">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Grid */}
                {!isLoading && !error && (
                    <>
                        {viewConfig.data.length === 0 ? (
                            <div className="text-center py-12">
                                <viewConfig.icon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Sin datos</h3>
                                <p className="mt-1 text-sm text-gray-500">{viewConfig.emptyMessage}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {/* Render Candidates */}
                                {navigation.level === 'candidates' && candidates.map((candidate) => (
                                    <div
                                        key={candidate.id}
                                        onClick={() => handleSelectCandidate(candidate)}
                                        className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-primary-300"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <IdentificationIcon className="h-8 w-8 text-blue-600" />
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <h3 className="text-lg font-medium text-gray-900">{candidate.name}</h3>
                                                    {candidate.position && (
                                                        <p className="text-sm text-gray-500">{candidate.position}</p>
                                                    )}
                                                </div>
                                                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Grupos</p>
                                                    <p className="mt-1 text-2xl font-semibold text-gray-900">{candidate.groupsCount || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Meta</p>
                                                    <p className="mt-1 text-2xl font-semibold text-gray-900">{candidate.meta.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="mt-3 grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500">Líderes</p>
                                                    <p className="text-sm font-medium text-purple-600">{candidate.leadersCount || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500">Votantes</p>
                                                    <p className="text-sm font-medium text-green-600">{candidate.votersCount?.toLocaleString() || 0}</p>
                                                </div>
                                            </div>

                                            {candidate.party && (
                                                <div className="mt-3">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {candidate.party}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Render Groups */}
                                {navigation.level === 'groups' && groups.map((group) => (
                                    <div
                                        key={group.id}
                                        onClick={() => handleSelectGroup(group)}
                                        className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-primary-300"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <UserGroupIcon className="h-8 w-8 text-green-600" />
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                                                    {group.zone && (
                                                        <p className="text-sm text-gray-500">Zona: {group.zone}</p>
                                                    )}
                                                </div>
                                                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Líderes</p>
                                                    <p className="mt-1 text-2xl font-semibold text-gray-900">{group.leadersCount || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Meta</p>
                                                    <p className="mt-1 text-2xl font-semibold text-gray-900">{group.meta.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500">Planillados</p>
                                                    <p className="text-sm font-medium text-primary-600">{group.planilladosCount?.toLocaleString() || 0}</p>
                                                </div>
                                            </div>

                                            {group.description && (
                                                <div className="mt-3">
                                                    <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Render Leaders */}
                                {navigation.level === 'leaders' && leaders.map((leader) => (
                                    <div
                                        key={leader.id}
                                        onClick={() => handleSelectLeader(leader)}
                                        className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-primary-300"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <AcademicCapIcon className="h-8 w-8 text-purple-600" />
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {leader.firstName} {leader.lastName}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">CC: {leader.cedula}</p>
                                                </div>
                                                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Planillados</p>
                                                    <p className="mt-1 text-2xl font-semibold text-gray-900">{leader.votersCount || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Meta</p>
                                                    <p className="mt-1 text-2xl font-semibold text-gray-900">{leader.meta.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center space-x-2">
                                                {leader.isVerified ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Verificado
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        Pendiente
                                                    </span>
                                                )}

                                                {leader.neighborhood && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {leader.neighborhood}
                                                    </span>
                                                )}
                                            </div>

                                            {leader.phone && (
                                                <div className="mt-3">
                                                    <p className="text-sm text-gray-600">{leader.phone}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Render Planillados */}
                                {navigation.level === 'planillados' && planillados.map((planillado) => (
                                    <div
                                        key={planillado.id}
                                        className="bg-white overflow-hidden shadow rounded-lg border border-gray-200"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <ClipboardDocumentCheckIcon className="h-8 w-8 text-primary-600" />
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {planillado.nombres} {planillado.apellidos}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">CC: {planillado.cedula}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 space-y-3">
                                                {planillado.celular && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <span className="font-medium">Teléfono:</span>
                                                        <span className="ml-2">{planillado.celular}</span>
                                                    </div>
                                                )}

                                                {planillado.barrioVive && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <span className="font-medium">Barrio:</span>
                                                        <span className="ml-2">{planillado.barrioVive}</span>
                                                    </div>
                                                )}

                                                {planillado.municipioVotacion && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <span className="font-medium">Vota en:</span>
                                                        <span className="ml-2">{planillado.municipioVotacion}</span>
                                                    </div>
                                                )}

                                                {planillado.zonaPuesto && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <span className="font-medium">Zona/Puesto:</span>
                                                        <span className="ml-2">{planillado.zonaPuesto}</span>
                                                    </div>
                                                )}

                                                {planillado.mesa && (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <span className="font-medium">Mesa:</span>
                                                        <span className="ml-2">{planillado.mesa}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-4 flex items-center space-x-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planillado.estado === 'verificado'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {planillado.estado === 'verificado' ? 'Verificado' : 'Pendiente'}
                                                </span>

                                                {planillado.esEdil && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        Edil
                                                    </span>
                                                )}

                                                {planillado.actualizado && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        Actualizado
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {(pagination.total || 0) > pagination.limit && (
                            <div className="mt-8 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Mostrando <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> a{' '}
                                    <span className="font-medium">
                                        {Math.min(pagination.page * pagination.limit, pagination.total || 0)}
                                    </span> de{' '}
                                    <span className="font-medium">{(pagination.total || 0).toLocaleString()}</span> resultados
                                </div>

                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={!pagination.hasPrevPage || isLoading}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Anterior
                                    </button>

                                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                        Página {pagination.page} de {pagination.totalPages || 1}
                                    </span>

                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={!pagination.hasNextPage || isLoading}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Siguiente
                                    </button>
                                </nav>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};