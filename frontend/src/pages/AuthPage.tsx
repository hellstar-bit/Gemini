// frontend/src/pages/AuthPage.tsx - VERSIÓN ORIGINAL RESTAURADA

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

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-sm font-bold">📊</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">Datos en tiempo real</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="w-8 h-8 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-sm font-bold">🗺️</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Mapas</h3>
              <p className="text-sm text-gray-600">Visualización territorial</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="w-8 h-8 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-sm font-bold">👥</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Votantes</h3>
              <p className="text-sm text-gray-600">Gestión de base electoral</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-sm font-bold">📋</span>
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