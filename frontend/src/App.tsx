import React from 'react'
import { useAppSelector, useAppDispatch } from './store/hooks'
import { addNotification } from './store/slices/appSlice'

function App() {
  const dispatch = useAppDispatch()
  const { notifications } = useAppSelector((state) => state.app)
  const { user, isLoading } = useAppSelector((state) => state.auth)

  const handleTestNotification = () => {
    dispatch(addNotification({
      type: 'success',
      title: '¡Redux funcionando!',
      message: 'GEMINI está configurado correctamente con Redux Toolkit',
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100">
      {/* Notificaciones */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg"
            >
              <h4 className="font-semibold">{notification.title}</h4>
              <p className="text-sm">{notification.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
                  GEMINI
                </h1>
                <p className="text-xs text-gray-500">
                  Backend ✅ | Redux ✅ | Sprint 1 
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleTestNotification}
                className="btn-gemini text-sm"
              >
                Probar Redux
              </button>
              {user ? (
                <span className="text-sm text-gray-600">👋 {user.firstName}</span>
              ) : (
                <span className="text-sm text-gray-600">No autenticado</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Resto del contenido anterior */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            ¡Sprint 1 casi completo! 🎉
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Backend NestJS + Frontend Redux + Tailwind CSS 4.1.11
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              ✅ NestJS Backend
            </span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              ✅ Redux Store
            </span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              ✅ TypeScript
            </span>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              ✅ Tailwind 4.1.11
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App