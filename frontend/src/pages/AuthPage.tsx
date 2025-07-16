import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-secondary-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-400/20 to-secondary-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary-400/20 to-accent-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary-300/10 to-secondary-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Hero */}
        <div className="text-center lg:text-left animate-fade-in">
          <div className="mb-8">
            <h1 className="text-6xl lg:text-7xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-secondary-600 bg-clip-text text-transparent">
                GEMINI
              </span>
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto lg:mx-0 mb-6"></div>
          </div>
          
          <p className="text-xl text-gray-700 mb-8 max-w-lg leading-relaxed">
            Plataforma de Gestión Política y Electoral. 
            Organiza, analiza y optimiza tu campaña electoral con tecnología de vanguardia.
          </p>
          
          <div className="grid grid-cols-2 gap-4 text-left mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">📊</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">Estadísticas en tiempo real y reportes detallados</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">🗺️</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Mapas</h3>
              <p className="text-sm text-gray-600">Visualización geográfica interactiva</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">👥</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Gestión</h3>
              <p className="text-sm text-gray-600">Candidatos, grupos y líderes</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">📈</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Reportes</h3>
              <p className="text-sm text-gray-600">Informes personalizados</p>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Sistema Activo</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span>Datos Seguros</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span>Tiempo Real</span>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};