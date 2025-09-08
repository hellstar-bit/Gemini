// frontend/src/components/layout/Sidebar.tsx - ACTUALIZADO con vista jerárquica
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import {
  HomeIcon,
  UserGroupIcon,
  CogIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CommandLineIcon,
  MapIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ArrowRightOnRectangleIcon,
  CloudArrowUpIcon,
  EyeIcon,
  ClipboardDocumentListIcon,
  QuestionMarkCircleIcon,
  DocumentDuplicateIcon,
  MapPinIcon,
  GlobeAltIcon,
  PresentationChartBarIcon,
  DocumentTextIcon,
  UsersIcon,
  IdentificationIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  RectangleStackIcon // ✅ NUEVO ICONO para vista jerárquica
} from '@heroicons/react/24/outline';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    description: 'Panel principal',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    name: 'Gestión de Campaña',
    href: '/campaign',
    icon: UsersIcon,
    description: 'Candidatos, grupos, líderes y planillados',
    gradient: 'from-indigo-500 to-indigo-600',
    children: [
      { 
        name: 'Vista Jerárquica', 
        href: '/campaign/hierarchy', 
        icon: RectangleStackIcon,
        description: 'Vista completa integrada',
        isNew: true // ✅ Marcar como nueva funcionalidad
      },
      { name: 'Candidatos', href: '/campaign/candidates', icon: IdentificationIcon },
      { name: 'Grupos', href: '/campaign/groups', icon: UserGroupIcon },
      { name: 'Líderes', href: '/campaign/leaders', icon: AcademicCapIcon },
      { name: 'Planillados', href: '/campaign/planillados', icon: ClipboardDocumentCheckIcon },
    ]
  },
  {
    name: 'Centro de Operaciones',
    href: '/operations',
    icon: CogIcon,
    description: 'Importación y gestión diaria',
    gradient: 'from-secondary-500 to-secondary-600',
    children: [
      { name: 'Importar Datos', href: '/operations/import', icon: CloudArrowUpIcon },
      { name: 'Monitor de Líderes', href: '/operations/leaders', icon: EyeIcon },
      { name: 'Análisis de Votantes', href: '/operations/voters', icon: ClipboardDocumentListIcon },
    ]
  },
  {
    name: 'Validación de Datos',
    href: '/validation',
    icon: ShieldCheckIcon,
    description: 'Control de calidad',
    gradient: 'from-accent-500 to-accent-600',
    children: [
      { name: 'Votantes sin Líder', href: '/validation/orphan-voters', icon: QuestionMarkCircleIcon },
      { name: 'Duplicados', href: '/validation/duplicates', icon: DocumentDuplicateIcon },
      { name: 'Errores Geográficos', href: '/validation/geo-errors', icon: MapPinIcon },
    ]
  },
  {
    name: 'Inteligencia Electoral',
    href: '/analytics',
    icon: ChartBarIcon,
    description: 'Analytics y mapas',
    gradient: 'from-purple-500 to-purple-600',
    children: [
      { name: 'Mapas Interactivos', href: '/analytics/maps', icon: GlobeAltIcon },
      { name: 'Estadísticas', href: '/analytics/stats', icon: PresentationChartBarIcon },
      { name: 'Reportes', href: '/analytics/reports', icon: DocumentTextIcon },
    ]
  },
  {
    name: 'Centro de Comando',
    href: '/command',
    icon: CommandLineIcon,
    description: 'Control en tiempo real',
    gradient: 'from-red-500 to-red-600'
  },
  {
    name: 'Datos de Referencia',
    href: '/reference',
    icon: MapIcon,
    description: 'Municipios y barrios',
    gradient: 'from-green-500 to-green-600'
  },
];

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['/campaign']); // ✅ Expandido por defecto

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white shadow-xl border-r border-gray-100 flex flex-col transition-all duration-500 ease-in-out relative`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50/30 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-secondary-50">
        {isCollapsed ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl hover:bg-white/80 transition-all duration-300 group shadow-sm border border-gray-200/50"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 animate-slide-in">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-secondary-600 bg-clip-text text-transparent">
                  GEMINI
                </h1>
                <p className="text-xs text-gray-500 font-medium">Plataforma Electoral</p>
              </div>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl hover:bg-white/80 transition-all duration-300 group shadow-sm border border-gray-200/50"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto relative ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <div className={`${isCollapsed ? 'space-y-2' : 'space-y-2'}`}>
          {navigation.map((item, index) => (
            <div key={item.href} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              {/* Parent Item */}
              <div className="group">
                {item.children ? (
                  isCollapsed ? (
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `flex items-center justify-center p-3 rounded-xl transition-all duration-300 group relative ${
                          isActive
                            ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                            : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-primary-50 hover:text-primary-600'
                        }`
                      }
                      title={item.name}
                    >
                      <item.icon className="w-6 h-6" />
                    </NavLink>
                  ) : (
                    <button
                      onClick={() => toggleExpanded(item.href)}
                      className="w-full flex items-center justify-between p-4 text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-primary-50 hover:text-primary-600 rounded-xl transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`min-w-[40px] min-h-[40px] w-10 h-10 max-w-[40px] max-h-[40px] bg-gradient-to-br ${item.gradient} rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 flex-shrink-0`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500 group-hover:text-primary-500">{item.description}</div>
                        </div>
                      </div>
                      <ChevronRightIcon 
                        className={`w-4 h-4 transition-transform duration-300 ${
                          expandedItems.includes(item.href) ? 'rotate-90' : ''
                        }`} 
                      />
                    </button>
                  )
                ) : (
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      isCollapsed
                        ? `flex items-center justify-center p-3 rounded-xl transition-all duration-300 group relative ${
                            isActive
                              ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                              : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-primary-50 hover:text-primary-600'
                          }`
                        : `w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 group ${
                            isActive
                              ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                              : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-primary-50 hover:text-primary-600'
                          }`
                    }
                    title={item.name}
                  >
                    {isCollapsed ? (
                      <item.icon className="w-6 h-6" />
                    ) : (
                      <>
                        <div className={`w-10 h-10 bg-gradient-to-br ${item.gradient} rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs opacity-80">{item.description}</div>
                        </div>
                      </>
                    )}
                  </NavLink>
                )}
              </div>

              {/* Children Items */}
              {item.children && !isCollapsed && expandedItems.includes(item.href) && (
                <div className="ml-6 mt-2 space-y-1 animate-slide-down">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.href}
                      to={child.href}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 text-sm rounded-lg transition-all duration-300 group ${
                          isActive
                            ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500'
                            : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600 border-l-4 border-transparent hover:border-primary-300'
                        }`
                      }
                    >
                      <child.icon className="w-4 h-4" />
                      <span className="font-medium flex items-center">
                        {child.name}
                        {/* ✅ Badge para nueva funcionalidad */}
                        {child.isNew && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Nuevo
                          </span>
                        )}
                      </span>
                      {child.description && (
                        <span className="ml-2 text-xs text-gray-400 hidden xl:block">
                          {child.description}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* User section */}
      <div className="relative p-4 border-t border-gray-100 bg-gradient-to-r from-primary-50/50 to-secondary-50/50">
        {isCollapsed ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Cerrar sesión"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
              title="Cerrar sesión"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};