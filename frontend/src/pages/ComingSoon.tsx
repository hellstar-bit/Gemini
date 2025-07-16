import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const ComingSoon: React.FC = () => {
  const location = useLocation();
  
  const getPageInfo = (path: string) => {
    const routes: Record<string, { name: string; icon: string; description: string; gradient: string }> = {
      '/campaign': { 
        name: 'Gestión de Campaña', 
        icon: '👥', 
        description: 'Administración completa de candidatos, grupos y líderes',
        gradient: 'from-primary-500 to-primary-600'
      },
      '/operations': { 
        name: 'Centro de Operaciones', 
        icon: '⚙️', 
        description: 'Importación de datos y gestión operativa diaria',
        gradient: 'from-secondary-500 to-secondary-600'
      },
      '/validation': { 
        name: 'Validación de Datos', 
        icon: '🔧', 
        description: 'Control de calidad y limpieza de datos electoral',
        gradient: 'from-accent-500 to-accent-600'
      },
      '/analytics': { 
        name: 'Inteligencia Electoral', 
        icon: '🧠', 
        description: 'Analytics avanzados y mapas interactivos de Barranquilla',
        gradient: 'from-purple-500 to-purple-600'
      },
      '/command': { 
        name: 'Centro de Comando', 
        icon: '🎛️', 
        description: 'Monitoreo y control en tiempo real de toda la campaña',
        gradient: 'from-red-500 to-red-600'
      },
      '/reference': { 
        name: 'Datos de Referencia', 
        icon: '🗺️', 
        description: 'Gestión de municipios, barrios y ubicaciones electorales',
        gradient: 'from-green-500 to-green-600'
      },
    };
    
    return routes[path] || { 
      name: 'Página', 
      icon: '📄', 
      description: 'Funcionalidad en desarrollo',
      gradient: 'from-gray-500 to-gray-600'
    };
  };

  const pageInfo = getPageInfo(location.pathname);

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center max-w-lg">
        {/* Icon with gradient background */}
        <div className={`w-32 h-32 bg-gradient-to-br ${pageInfo.gradient} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl`}>
          <span className="text-6xl">{pageInfo.icon}</span>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{pageInfo.name}</h1>
        <p className="text-gray-600 mb-8 text-lg leading-relaxed">{pageInfo.description}</p>
        
        <div className="bg-gradient-to-r from-blue-50 to-primary-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">🚧</span>
            </div>
          </div>
          <p className="text-blue-800 font-semibold text-lg mb-2">Próximamente</p>
          <p className="text-blue-600 text-sm">
            Esta funcionalidad se implementará en los próximos sprints del desarrollo de GEMINI.
            Estamos trabajando para ofrecerte la mejor experiencia electoral.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 btn-gemini"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Volver al Dashboard</span>
        </Link>
      </div>
    </div>
  );
};