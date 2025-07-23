// frontend/src/components/notifications/PlanilladosLiderNotification.tsx

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  UserGroupIcon, 
  CheckIcon, 
  XMarkIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { addNotification } from '../../store/slices/appSlice';
import { planilladosService } from '../../services/planilladosService';

interface PlanilladosLiderNotificationProps {
  leader: {
    id: number;
    cedula: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  planillados: Array<{
    id: number;
    cedula: string;
    nombres: string;
    apellidos: string;
    cedulaLiderPendiente: string;
  }>;
  onClose: () => void;
  onConfirm: (planilladoIds: number[]) => void;
}

export const PlanilladosLiderNotification: React.FC<PlanilladosLiderNotificationProps> = ({
  leader,
  planillados,
  onClose,
  onConfirm
}) => {
  const dispatch = useDispatch();
  const [selectedPlanillados, setSelectedPlanillados] = useState<number[]>(
    planillados.map(p => p.id) // Por defecto, todos seleccionados
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar planillados por búsqueda
  const filteredPlanillados = planillados.filter(planillado =>
    planillado.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    planillado.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    planillado.cedula.includes(searchTerm)
  );

  const handleTogglePlanillado = (planilladoId: number) => {
    setSelectedPlanillados(prev => 
      prev.includes(planilladoId)
        ? prev.filter(id => id !== planilladoId)
        : [...prev, planilladoId]
    );
  };

  const handleToggleAll = () => {
    if (selectedPlanillados.length === filteredPlanillados.length) {
      setSelectedPlanillados([]);
    } else {
      setSelectedPlanillados(filteredPlanillados.map(p => p.id));
    }
  };

  const handleConfirm = async () => {
    if (selectedPlanillados.length === 0) {
      dispatch(addNotification({
        type: 'warning',
        title: 'Selección requerida',
        message: 'Debes seleccionar al menos un planillado para relacionar'
      }));
      return;
    }

    setIsProcessing(true);
    try {
      const result = await planilladosService.relacionarPlanilladosPendientes(
        leader.cedula,
        leader.id,
        selectedPlanillados
      );

      dispatch(addNotification({
        type: 'success',
        title: 'Relación completada exitosamente',
        message: `${result.affected} planillado(s) relacionado(s) con ${leader.firstName} ${leader.lastName}`
      }));

      onConfirm(selectedPlanillados);
      onClose();
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error al relacionar planillados',
        message: error.message || 'No se pudieron relacionar los planillados'
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    dispatch(addNotification({
      type: 'info',
      title: 'Relación pospuesta',
      message: 'Los planillados quedan pendientes. Puedes relacionarlos manualmente más tarde.'
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        
        {/* ===== HEADER ===== */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                <UserGroupIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Planillados Pendientes Encontrados</h3>
                <p className="text-blue-100 mt-1 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Se encontraron {planillados.length} planillado(s) esperando relación con este líder
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-full"
              title="Cerrar"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ===== CONTENT ===== */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
          
          {/* Leader Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 mb-6 border border-blue-200">
            <div className="flex items-center">
              <div className="bg-blue-500 rounded-full p-3 mr-4">
                <UserIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-blue-900 mb-1">Líder Registrado</h4>
                <p className="text-blue-800 font-medium">
                  {leader.firstName} {leader.lastName}
                </p>
                <div className="flex items-center mt-1 text-sm text-blue-600">
                  <span className="mr-4">📋 C.C. {leader.cedula}</span>
                  {leader.phone && (
                    <span className="mr-4">📱 {leader.phone}</span>
                  )}
                  {leader.email && (
                    <span>📧 {leader.email}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 mb-6">
            <div className="flex">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-amber-800">
                <p className="font-medium mb-2">¿Deseas relacionar estos planillados con el líder?</p>
                <div className="text-sm space-y-1">
                  <p>• Los planillados seleccionados se vincularán automáticamente con <strong>{leader.firstName} {leader.lastName}</strong></p>
                  <p>• Puedes deseleccionar los que no desees relacionar</p>
                  <p>• Esta acción no se puede deshacer desde aquí, pero puedes cambiar la asignación manualmente después</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Planillados Pendientes
              </h4>
              
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por nombre o cédula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Select All Toggle */}
                <button
                  onClick={handleToggleAll}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  {selectedPlanillados.length === filteredPlanillados.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                </button>
              </div>
            </div>

            {/* Selection Counter */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>
                Mostrando {filteredPlanillados.length} de {planillados.length} planillados
              </span>
              <span className="font-medium">
                {selectedPlanillados.length} seleccionado(s)
              </span>
            </div>
          </div>

          {/* Planillados List */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedPlanillados.length === filteredPlanillados.length && filteredPlanillados.length > 0}
                  onChange={handleToggleAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                />
                <div className="grid grid-cols-12 gap-4 w-full text-sm font-medium text-gray-700">
                  <div className="col-span-4">Nombre Completo</div>
                  <div className="col-span-3">Cédula</div>
                  <div className="col-span-3">Esperando Líder</div>
                  <div className="col-span-2">Estado</div>
                </div>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {filteredPlanillados.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <UserGroupIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No se encontraron planillados</p>
                  {searchTerm && (
                    <p className="text-sm mt-1">Intenta con otro término de búsqueda</p>
                  )}
                </div>
              ) : (
                filteredPlanillados.map((planillado, index) => (
                  <div
                    key={planillado.id}
                    className={`flex items-center px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlanillados.includes(planillado.id)}
                      onChange={() => handleTogglePlanillado(planillado.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                    />
                    
                    <div className="grid grid-cols-12 gap-4 w-full items-center">
                      <div className="col-span-4">
                        <p className="font-medium text-gray-900">
                          {planillado.nombres} {planillado.apellidos}
                        </p>
                      </div>
                      
                      <div className="col-span-3">
                        <p className="text-gray-600 font-mono">{planillado.cedula}</p>
                      </div>
                      
                      <div className="col-span-3">
                        <p className="text-sm text-amber-600 font-medium">
                          C.C. {planillado.cedulaLiderPendiente}
                        </p>
                      </div>
                      
                      <div className="col-span-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          Pendiente
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ===== FOOTER / ACTIONS ===== */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            
            {/* Summary */}
            <div className="text-sm text-gray-600">
              {selectedPlanillados.length > 0 ? (
                <span className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                  {selectedPlanillados.length} planillado(s) seleccionado(s) para relacionar
                </span>
              ) : (
                <span className="text-amber-600">
                  No hay planillados seleccionados
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              
              {/* Skip Button */}
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                disabled={isProcessing}
              >
                Posponer
              </button>

              {/* Cancel Button */}
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                disabled={isProcessing}
              >
                Cancelar
              </button>
              
              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                disabled={isProcessing || selectedPlanillados.length === 0}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium min-w-[140px] justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Relacionar ({selectedPlanillados.length})
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Help Text */}
          <div className="mt-3 text-xs text-gray-500 border-t border-gray-200 pt-3">
            💡 <strong>Tip:</strong> Si no relacionas ahora, podrás hacerlo manualmente más tarde desde la sección de planillados.
            Los planillados quedarán marcados como "pendientes" hasta que los asignes.
          </div>
        </div>
      </div>
    </div>
  );
};

// =====================================
// ✅ COMPONENTE AUXILIAR - PLANILLADO CARD
// =====================================

interface PlanilladoCardProps {
  planillado: {
    id: number;
    cedula: string;
    nombres: string;
    apellidos: string;
    cedulaLiderPendiente: string;
  };
  isSelected: boolean;
  onToggle: (id: number) => void;
}

export const PlanilladoCard: React.FC<PlanilladoCardProps> = ({
  planillado,
  isSelected,
  onToggle
}) => {
  return (
    <div
      className={`p-4 border rounded-lg transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={() => onToggle(planillado.id)}
    >
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(planillado.id)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
          onClick={(e) => e.stopPropagation()}
        />
        
        <div className="flex-1">
          <h5 className="font-medium text-gray-900">
            {planillado.nombres} {planillado.apellidos}
          </h5>
          <div className="text-sm text-gray-600 mt-1 space-y-1">
            <p>📋 C.C. {planillado.cedula}</p>
            <p className="text-amber-600">
              ⏳ Esperando líder: {planillado.cedulaLiderPendiente}
            </p>
          </div>
        </div>
        
        {isSelected && (
          <CheckCircleIcon className="w-5 h-5 text-blue-500 ml-2" />
        )}
      </div>
    </div>
  );
};

// =====================================
// ✅ HOOK PERSONALIZADO - NOTIFICACIÓN
// =====================================

export const usePlanilladosLiderNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [notificationData, setNotificationData] = useState<{
    leader?: any;
    planillados?: any[];
  }>({});

  const showNotification = (leader: any, planillados: any[]) => {
    setNotificationData({ leader, planillados });
    setIsVisible(true);
  };

  const hideNotification = () => {
    setIsVisible(false);
    setNotificationData({});
  };

  const handleConfirm = (planilladoIds: number[]) => {
    console.log('Planillados relacionados:', planilladoIds);
    // Aquí puedes agregar lógica adicional si es necesaria
  };

  return {
    isVisible,
    notificationData,
    showNotification,
    hideNotification,
    handleConfirm
  };
};