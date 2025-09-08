// frontend/src/components/hierarchy/HierarchyStats.tsx
import React from 'react';
import {
    IdentificationIcon,
    UserGroupIcon,
    AcademicCapIcon,
    ClipboardDocumentCheckIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    CheckCircleIcon,
    ClockIcon,
    StarIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// =====================================
// INTERFACES Y TIPOS
// =====================================

interface HierarchyStatsProps {
    level: 'candidates' | 'groups' | 'leaders' | 'planillados';
    selectedCandidate?: {
        id: number;
        name: string;
        groupsCount: number;
        leadersCount: number;
        votersCount: number;
        meta: number;
        party?: string;
        position?: string;
    };
    selectedGroup?: {
        id: number;
        name: string;
        leadersCount: number;
        planilladosCount: number;
        meta: number;
        zone?: string;
        candidateId: number;
    };
    selectedLeader?: {
        id: number;
        firstName: string;
        lastName: string;
        votersCount: number;
        meta: number;
        isVerified: boolean;
        neighborhood?: string;
        municipality?: string;
        cedula: string;
    };
    totalItems: number;
    loading?: boolean;
    className?: string;
}

interface StatItem {
    name: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: string;
    change?: number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'stable';
    priority?: 'high' | 'medium' | 'low';
}

interface ProgressBarProps {
    title: string;
    current: number;
    target: number;
    subtitle?: string;
    color?: 'primary' | 'green' | 'yellow' | 'red' | 'blue';
}

// =====================================
// COMPONENTES AUXILIARES
// =====================================

const ProgressBar: React.FC<ProgressBarProps> = ({
    title,
    current,
    target,
    subtitle,
    color = 'primary'
}) => {
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

    const getColorClasses = () => {
        switch (color) {
            case 'green': return 'bg-green-500';
            case 'yellow': return 'bg-yellow-500';
            case 'red': return 'bg-red-500';
            case 'blue': return 'bg-blue-500';
            default: return 'bg-primary-500';
        }
    };

    return (
        <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <span className="text-sm font-medium text-gray-700">{title}</span>
                    {subtitle && (
                        <p className="text-xs text-gray-500">{subtitle}</p>
                    )}
                </div>
                <div className="text-right">
                    <span className="text-sm text-gray-500">
                        {current.toLocaleString()} / {target.toLocaleString()}
                    </span>
                    <p className="text-xs font-medium text-gray-700">
                        {percentage.toFixed(1)}%
                    </p>
                </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                    className={`h-3 rounded-full transition-all duration-500 ${getColorClasses()}`}
                    style={{ width: `${percentage}%` }}
                >
                    {percentage > 10 && (
                        <div className="h-full flex items-center justify-end pr-2">
                            <span className="text-xs font-medium text-white">
                                {percentage >= 100 ? '✓' : `${Math.round(percentage)}%`}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {percentage >= 100 && (
                <div className="mt-2 flex items-center text-green-600">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    <span className="text-xs font-medium">Meta alcanzada</span>
                </div>
            )}
        </div>
    );
};

const StatCard: React.FC<{ stat: StatItem }> = ({ stat }) => {
    const getColorClasses = (color: string) => {
        const colorMap: Record<string, string> = {
            blue: 'text-blue-600 bg-blue-100',
            green: 'text-green-600 bg-green-100',
            purple: 'text-purple-600 bg-purple-100',
            primary: 'text-primary-600 bg-primary-100',
            orange: 'text-orange-600 bg-orange-100',
            yellow: 'text-yellow-600 bg-yellow-100',
            red: 'text-red-600 bg-red-100',
            gray: 'text-gray-600 bg-gray-100',
            emerald: 'text-emerald-600 bg-emerald-100',
            indigo: 'text-indigo-600 bg-indigo-100',
        };
        return colorMap[color] || 'text-gray-600 bg-gray-100';
    };

    const getTrendIcon = () => {
        if (!stat.trend) return null;

        switch (stat.trend) {
            case 'up':
                return <ArrowTrendingUpIcon className="w-3 h-3 text-green-500" />;
            case 'down':
                return <ArrowTrendingUpIcon className="w-3 h-3 text-red-500 transform rotate-180" />;
            default:
                return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
        }
    };

    const getPriorityIndicator = () => {
        if (!stat.priority) return null;

        switch (stat.priority) {
            case 'high':
                return <ExclamationTriangleIcon className="w-3 h-3 text-red-500" />;
            case 'medium':
                return <ClockIcon className="w-3 h-3 text-yellow-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-50 rounded-lg p-4 relative overflow-hidden">
            {/* Priority indicator */}
            {stat.priority === 'high' && (
                <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-red-500" />
            )}

            <div className="flex items-center">
                <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${getColorClasses(stat.color)}`}>
                    <stat.icon className="w-5 h-5" />
                </div>
                <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {stat.name}
                        </p>
                        <div className="flex items-center space-x-1">
                            {getTrendIcon()}
                            {getPriorityIndicator()}
                        </div>
                    </div>
                    <div className="flex items-baseline">
                        <p className="text-lg font-semibold text-gray-900">
                            {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                        </p>
                        {stat.change !== undefined && (
                            <span className={`ml-2 text-xs font-medium ${stat.change > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {stat.change > 0 ? '+' : ''}{stat.change}%
                            </span>
                        )}
                    </div>
                    {stat.subtitle && (
                        <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// =====================================
// COMPONENTE PRINCIPAL
// =====================================

export const HierarchyStats: React.FC<HierarchyStatsProps> = ({
    level,
    selectedCandidate,
    selectedGroup,
    selectedLeader,
    totalItems,
    loading = false,
    className = ''
}) => {

    // ✅ Generar estadísticas según el nivel
    const getStatsForLevel = (): StatItem[] => {
        switch (level) {
            case 'candidates':
                return [
                    {
                        name: 'Total Candidatos',
                        value: totalItems,
                        icon: IdentificationIcon,
                        color: 'blue',
                        subtitle: 'Candidatos registrados en el sistema'
                    }
                ];

            case 'groups':
                if (!selectedCandidate) return [];

                const groupEfficiency = selectedCandidate.groupsCount > 0
                    ? Math.round((selectedCandidate.leadersCount / selectedCandidate.groupsCount) * 100) / 100
                    : 0;

                const voterDensity = selectedCandidate.leadersCount > 0
                    ? Math.round(selectedCandidate.votersCount / selectedCandidate.leadersCount)
                    : 0;

                return [
                    {
                        name: 'Grupos Activos',
                        value: totalItems,
                        icon: UserGroupIcon,
                        color: 'green',
                        subtitle: `de ${selectedCandidate.groupsCount} grupos totales`
                    },
                    {
                        name: 'Total Líderes',
                        value: selectedCandidate.leadersCount,
                        icon: AcademicCapIcon,
                        color: 'purple',
                        subtitle: `${groupEfficiency} líderes por grupo`
                    },
                    {
                        name: 'Base Electoral',
                        value: selectedCandidate.votersCount,
                        icon: ClipboardDocumentCheckIcon,
                        color: 'primary',
                        subtitle: `${voterDensity} votantes por líder`
                    },
                    {
                        name: 'Meta Candidato',
                        value: selectedCandidate.meta.toLocaleString(),
                        icon: ArrowTrendingUpIcon,
                        color: 'orange',
                        subtitle: selectedCandidate.position || 'Meta de votos',
                        priority: selectedCandidate.votersCount < selectedCandidate.meta * 0.5 ? 'high' : 'medium'
                    }
                ];

            case 'leaders':
                if (!selectedGroup) return [];

                const leaderEfficiency = selectedGroup.leadersCount > 0
                    ? Math.round(selectedGroup.planilladosCount / selectedGroup.leadersCount)
                    : 0;

                const groupProgress = selectedGroup.meta > 0
                    ? Math.round((selectedGroup.planilladosCount / selectedGroup.meta) * 100)
                    : 0;

                return [
                    {
                        name: 'Líderes del Grupo',
                        value: totalItems,
                        icon: AcademicCapIcon,
                        color: 'purple',
                        subtitle: `en ${selectedGroup.zone || 'la zona asignada'}`
                    },
                    {
                        name: 'Planillados',
                        value: selectedGroup.planilladosCount,
                        icon: ClipboardDocumentCheckIcon,
                        color: 'primary',
                        subtitle: `${leaderEfficiency} por líder promedio`
                    },
                    {
                        name: 'Meta del Grupo',
                        value: selectedGroup.meta.toLocaleString(),
                        icon: ArrowTrendingUpIcon,
                        color: 'orange',
                        subtitle: `${groupProgress}% completado`,
                        trend: groupProgress >= 75 ? 'up' : groupProgress >= 50 ? 'stable' : 'down'
                    },
                    {
                        name: 'Rendimiento',
                        value: `${groupProgress}%`,
                        icon: ChartBarIcon,
                        color: groupProgress >= 75 ? 'green' : groupProgress >= 50 ? 'yellow' : 'red',
                        subtitle: 'Progreso hacia la meta',
                        priority: groupProgress < 25 ? 'high' : groupProgress < 50 ? 'medium' : 'low'
                    }
                ];

            case 'planillados':
                if (!selectedLeader) return [];

                const voterProgress = selectedLeader.meta > 0
                    ? Math.round((selectedLeader.votersCount / selectedLeader.meta) * 100)
                    : 0;

                const remaining = Math.max(selectedLeader.meta - selectedLeader.votersCount, 0);

                return [
                    {
                        name: 'Planillados Asignados',
                        value: totalItems,
                        icon: ClipboardDocumentCheckIcon,
                        color: 'primary',
                        subtitle: `del líder ${selectedLeader.firstName}`
                    },
                    {
                        name: 'Meta Personal',
                        value: selectedLeader.meta.toLocaleString(),
                        icon: ArrowTrendingUpIcon,
                        color: 'orange',
                        subtitle: `${remaining.toLocaleString()} faltantes`
                    },
                    {
                        name: 'Progreso',
                        value: `${voterProgress}%`,
                        icon: ChartBarIcon,
                        color: voterProgress >= 100 ? 'green' : voterProgress >= 75 ? 'yellow' : 'red',
                        subtitle: voterProgress >= 100 ? 'Meta cumplida' : 'En progreso',
                        trend: voterProgress >= 75 ? 'up' : 'stable'
                    },
                    {
                        name: 'Estado',
                        value: selectedLeader.isVerified ? 'Verificado' : 'Pendiente',
                        icon: selectedLeader.isVerified ? CheckCircleIcon : ClockIcon,
                        color: selectedLeader.isVerified ? 'green' : 'yellow',
                        subtitle: selectedLeader.neighborhood || selectedLeader.municipality || 'Sin ubicación',
                        priority: !selectedLeader.isVerified ? 'medium' : 'low'
                    }
                ];

            default:
                return [];
        }
    };

    // ✅ Obtener configuración de progreso
    const getProgressConfig = (): ProgressBarProps | null => {
        switch (level) {
            case 'groups':
                if (!selectedCandidate) return null;
                return {
                    title: 'Progreso hacia la meta del candidato',
                    current: selectedCandidate.votersCount,
                    target: selectedCandidate.meta,
                    subtitle: `${selectedCandidate.name} - ${selectedCandidate.position || 'Candidato'}`,
                    color: selectedCandidate.votersCount >= selectedCandidate.meta ? 'green' :
                        selectedCandidate.votersCount >= selectedCandidate.meta * 0.75 ? 'yellow' : 'primary'
                };

            case 'leaders':
                if (!selectedGroup) return null;
                return {
                    title: 'Progreso hacia la meta del grupo',
                    current: selectedGroup.planilladosCount,
                    target: selectedGroup.meta,
                    subtitle: `Grupo ${selectedGroup.name}${selectedGroup.zone ? ` - ${selectedGroup.zone}` : ''}`,
                    color: selectedGroup.planilladosCount >= selectedGroup.meta ? 'green' :
                        selectedGroup.planilladosCount >= selectedGroup.meta * 0.75 ? 'yellow' : 'primary'
                };

            case 'planillados':
                if (!selectedLeader) return null;
                return {
                    title: 'Progreso hacia la meta personal',
                    current: selectedLeader.votersCount,
                    target: selectedLeader.meta,
                    subtitle: `${selectedLeader.firstName} ${selectedLeader.lastName} - CC: ${selectedLeader.cedula}`,
                    color: selectedLeader.votersCount >= selectedLeader.meta ? 'green' :
                        selectedLeader.votersCount >= selectedLeader.meta * 0.75 ? 'yellow' : 'primary'
                };

            default:
                return null;
        }
    };

    const stats = getStatsForLevel();
    const progressConfig = getProgressConfig();

    // ✅ Estado de carga
    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow p-6 mb-6 ${className}`}>
                <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-5 bg-gray-200 rounded w-48"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
                                    <div className="ml-3 flex-1">
                                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Progress bar loading */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="w-full bg-gray-200 rounded-full h-3"></div>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ Sin datos
    if (stats.length === 0) return null;

    // ✅ Obtener información contextual del nivel
    const getLevelInfo = () => {
        switch (level) {
            case 'candidates':
                return {
                    title: 'Vista General de Candidatos',
                    description: 'Estadísticas generales de todos los candidatos'
                };
            case 'groups':
                return {
                    title: `Análisis del Candidato: ${selectedCandidate?.name}`,
                    description: selectedCandidate?.party
                        ? `${selectedCandidate.party} - ${selectedCandidate.position || 'Candidato'}`
                        : 'Estadísticas de grupos y estructura electoral'
                };
            case 'leaders':
                return {
                    title: `Rendimiento del Grupo: ${selectedGroup?.name}`,
                    description: selectedGroup?.zone
                        ? `Zona: ${selectedGroup.zone}`
                        : 'Análisis de líderes y coordinación territorial'
                };
            case 'planillados':
                return {
                    title: `Gestión del Líder: ${selectedLeader?.firstName} ${selectedLeader?.lastName}`,
                    description: selectedLeader?.neighborhood
                        ? `${selectedLeader.neighborhood}, ${selectedLeader.municipality || ''}`
                        : 'Planillados asignados y progreso personal'
                };
        }
    };

    const levelInfo = getLevelInfo();

    return (
        <div className={`bg-white rounded-lg shadow p-6 mb-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">{levelInfo.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{levelInfo.description}</p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                    <ChartBarIcon className="w-4 h-4 mr-1" />
                    Métricas en tiempo real
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <StatCard key={index} stat={stat} />
                ))}
            </div>

            {/* Progress Bar */}
            {progressConfig && (
                <ProgressBar {...progressConfig} />
            )}

            {/* Additional insights for specific levels */}
            {level === 'planillados' && selectedLeader && selectedLeader.votersCount >= selectedLeader.meta && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                        <StarIcon className="w-5 h-5 text-green-500 mr-2" />
                        <div>
                            <p className="text-sm font-medium text-green-800">
                                ¡Excelente trabajo!
                            </p>
                            <p className="text-xs text-green-700">
                                Este líder ha superado su meta personal de planillados.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {level === 'leaders' && selectedGroup && (selectedGroup.planilladosCount / selectedGroup.meta) < 0.25 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                        <div>
                            <p className="text-sm font-medium text-yellow-800">
                                Atención requerida
                            </p>
                            <p className="text-xs text-yellow-700">
                                Este grupo necesita más actividad para alcanzar su meta.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};