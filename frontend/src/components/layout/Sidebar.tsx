import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import {
  HomeIcon,
  UsersIcon,
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
  UserGroupIcon,
  IdentificationIcon,
  AcademicCapIcon
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
    description: 'Candidatos, grupos y líderes',
    gradient: 'from-primary-500 to-primary-600',
    children: [
      { name: 'Candidatos', href: '/campaign/candidates', icon: IdentificationIcon },
      { name: 'Grupos', href: '/campaign/groups', icon: UserGroupIcon },
      { name: 'Líderes', href: '/campaign/leaders', icon: AcademicCapIcon },
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
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleLogout = () => {
    dispatch(logoutUser());
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
          /* Header colapsado */
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
          /* Header expandido */
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
                  // Items con hijos - en modo colapsado van directo a la ruta principal
                  isCollapsed ? (
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `flex items-center justify-center p-3 rounded-xl transition-all duration-300 group hover:shadow-md ${
                          isActive 
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-[1.05]' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`
                      }
                      title={item.name}
                    >
                      {({ isActive }) => (
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          isActive 
                            ? 'bg-white/20' 
                            : `bg-gradient-to-br ${item.gradient} shadow-sm`
                        }`}>
                          <item.icon className={`w-5 h-5 text-white`} />
                        </div>
                      )}
                    </NavLink>
                  ) : (
                    <button
                      onClick={() => toggleExpanded(item.href)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 group-hover:shadow-md ${
                        expandedItems.includes(item.href) 
                          ? 'bg-gradient-to-r from-primary-50 to-secondary-50 shadow-sm border border-primary-200/50' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 bg-gradient-to-br ${item.gradient} rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-gray-900 text-sm">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </div>
                      <ChevronRightIcon 
                        className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                          expandedItems.includes(item.href) ? 'rotate-90' : ''
                        }`} 
                      />
                    </button>
                  )
                ) : (
                  // Items sin hijos
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `flex items-center ${isCollapsed ? 'justify-center p-3' : 'space-x-4 p-4'} rounded-xl transition-all duration-300 group hover:shadow-md ${
                        isActive 
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg transform scale-[1.02]' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`
                    }
                    title={isCollapsed ? item.name : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg flex items-center justify-center shadow-sm transition-all duration-300 ${
                          isActive 
                            ? 'bg-white/20' 
                            : `bg-gradient-to-br ${item.gradient} group-hover:shadow-md`
                        }`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        {!isCollapsed && (
                          <div>
                            <div className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-900'}`}>
                              {item.name}
                            </div>
                            <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                              {item.description}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                )}
              </div>

              {/* Children Items - Solo se muestran cuando NO está colapsado */}
              {item.children && expandedItems.includes(item.href) && !isCollapsed && (
                <div className="ml-6 mt-3 space-y-2 animate-slide-in">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.href}
                      to={child.href}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 p-3 rounded-lg text-sm transition-all duration-300 ${
                          isActive 
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <child.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                          <span className={`font-medium ${isActive ? 'text-white' : ''}`}>
                            {child.name}
                          </span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="relative p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-primary-50/30">
        {!isCollapsed ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-bold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 group hover:shadow-sm"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 flex flex-col items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">
                {user?.firstName?.charAt(0)}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 group hover:shadow-sm"
              title="Cerrar Sesión"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};