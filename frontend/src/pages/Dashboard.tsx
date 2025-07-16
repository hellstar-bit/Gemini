import React from 'react';
import { useAppSelector } from '../store/hooks';
import {
  UsersIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
  EyeIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

export const Dashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  const stats = [
    {
      name: 'Total Líderes',
      value: '1,245',
      change: '+12%',
      changeType: 'positive',
      icon: UsersIcon,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Total Planillados',
      value: '52,582',
      change: '+8.2%',
      changeType: 'positive',
      icon: ChartBarIcon,
      gradient: 'from-secondary-500 to-secondary-600',
    },
    {
      name: 'Verificados',
      value: '48,320',
      change: '+5.1%',
      changeType: 'positive',
      icon: CheckCircleIcon,
      gradient: 'from-green-500 to-green-600',
    },
    {
      name: 'Pendientes',
      value: '4,262',
      change: '-2.3%',
      changeType: 'negative',
      icon: ExclamationTriangleIcon,
      gradient: 'from-accent-500 to-accent-600',
    },
  ];

  const quickActions = [
    {
      name: 'Importar Datos',
      description: 'Cargar planillas Excel',
      icon: CloudArrowUpIcon,
      gradient: 'from-primary-500 to-primary-600',
      href: '/operations/import'
    },
    {
      name: 'Gestionar Líderes',
      description: 'Ver y editar líderes',
      icon: EyeIcon,
      gradient: 'from-secondary-500 to-secondary-600',
      href: '/campaign/leaders'
    },
    {
      name: 'Ver Reportes',
      description: 'Generar informes',
      icon: DocumentTextIcon,
      gradient: 'from-purple-500 to-purple-600',
      href: '/analytics/reports'
    },
    {
      name: 'Mapa Electoral',
      description: 'Vista geográfica',
      icon: GlobeAltIcon,
      gradient: 'from-green-500 to-green-600',
      href: '/analytics/maps'
    },
  ];

  const recentActivity = [
    {
      type: 'import',
      title: 'Importación exitosa',
      description: '245 nuevos votantes agregados',
      time: 'Hace 2 horas',
      icon: CloudArrowUpIcon,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      type: 'user',
      title: 'Nuevo líder registrado',
      description: 'María González se unió al grupo',
      time: 'Hace 4 horas',
      icon: UserPlusIcon,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      type: 'report',
      title: 'Reporte generado',
      description: 'Estadísticas mensuales completadas',
      time: 'Hace 6 horas',
      icon: DocumentTextIcon,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      type: 'validation',
      title: 'Validación completada',
      description: '1,234 registros verificados',
      time: 'Hace 8 horas',
      icon: CheckCircleIcon,
      iconColor: 'text-secondary-600',
      bgColor: 'bg-secondary-50'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-3">
            ¡Bienvenido, {user?.firstName}! 👋
          </h1>
          <p className="text-primary-100 text-lg">
            Panel principal de GEMINI - Plataforma de Gestión Política Electoral
          </p>
          <div className="mt-6 flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4" />
              <span>Última actualización: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowTrendingUpIcon className="w-4 h-4" />
              <span>Sistema operativo al 100%</span>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 translate-x-16"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={stat.name} className="card-gemini p-6 group cursor-pointer" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className={`text-sm font-semibold ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 card-gemini p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Actividad Reciente</h3>
            <span className="text-sm text-gray-500">Últimas 24 horas</span>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 group">
                <div className={`w-10 h-10 ${activity.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-gemini p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h3>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button 
                key={action.name} 
                className="w-full p-4 border border-gray-200 rounded-xl hover:border-transparent hover:shadow-lg transition-all duration-300 text-left group bg-gradient-to-r hover:from-gray-50 hover:to-primary-50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 bg-gradient-to-br ${action.gradient} rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{action.name}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="card-gemini p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Progreso de la Campaña</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-2xl font-bold">92%</span>
            </div>
            <h4 className="font-semibold text-gray-900">Líderes Activos</h4>
            <p className="text-sm text-gray-600">1,145 de 1,245 líderes</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-2xl font-bold">87%</span>
            </div>
            <h4 className="font-semibold text-gray-900">Meta Alcanzada</h4>
            <p className="text-sm text-gray-600">52,582 de 60,000 votos</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-2xl font-bold">94%</span>
            </div>
            <h4 className="font-semibold text-gray-900">Datos Validados</h4>
            <p className="text-sm text-gray-600">48,320 de 51,400 registros</p>
          </div>
        </div>
      </div>
    </div>
  );
};