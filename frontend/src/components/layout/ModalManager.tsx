// frontend/src/components/layout/ModalManager.tsx

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { PlanilladosLiderNotification } from '../notifications/PlanilladosLiderNotification';

// =====================================
// ✅ TIPOS DE INTERFACES
// =====================================

type LeaderInfo = {
  id: number;
  cedula: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
};

type PlanilladoInfo = {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  cedulaLiderPendiente: string;
};

interface ModalManagerProps {}

export interface ModalManagerRef {
  showPlanilladosLiderModal: (leader: LeaderInfo, planillados: PlanilladoInfo[]) => void;
  closePlanilladosLiderModal: () => void;
  closeAllModals: () => void;
}

interface PlanilladosLiderModalState {
  visible: boolean;
  leader?: LeaderInfo;
  planillados?: PlanilladoInfo[];
}

// =====================================
// ✅ COMPONENTE MODAL MANAGER
// =====================================

export const ModalManager = forwardRef<ModalManagerRef, ModalManagerProps>((_props, ref) => {
  
  // Estados de los diferentes modales
  const [planilladosLiderModal, setPlanilladosLiderModal] = useState<PlanilladosLiderModalState>({
    visible: false
  });

  // =====================================
  // ✅ MÉTODOS EXPUESTOS VIA REF
  // =====================================

  useImperativeHandle(ref, () => ({
    
    // Mostrar modal de planillados-líder
    showPlanilladosLiderModal: (leader: LeaderInfo, planillados: PlanilladoInfo[]) => {
      console.log('🔔 Mostrando modal planillados-líder:', { leader, planillados });
      
      setPlanilladosLiderModal({
        visible: true,
        leader,
        planillados
      });
    },

    // Cerrar modal de planillados-líder
    closePlanilladosLiderModal: () => {
      setPlanilladosLiderModal({ visible: false });
    },

    // Cerrar todos los modales
    closeAllModals: () => {
      setPlanilladosLiderModal({ visible: false });
      // Agregar aquí otros modales cuando se implementen
    }
  }));

  // =====================================
  // ✅ MANEJADORES DE EVENTOS
  // =====================================

  const handlePlanilladosLiderConfirm = (planilladoIds: number[]) => {
    console.log('✅ Planillados relacionados desde modal:', planilladoIds);
    
    // Aquí puedes agregar lógica adicional si es necesaria
    // Por ejemplo, actualizar estado global, hacer llamadas adicionales, etc.
    
    // Opcional: Emitir evento personalizado
    const event = new CustomEvent('planillados-relacionados', {
      detail: {
        leaderId: planilladosLiderModal.leader?.id,
        planilladoIds,
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(event);
  };

  const handlePlanilladosLiderClose = () => {
    console.log('❌ Cerrando modal planillados-líder');
    setPlanilladosLiderModal({ visible: false });
  };

  // =====================================
  // ✅ RENDER
  // =====================================

  return (
    <>
      {/* ===== MODAL PLANILLADOS-LÍDER ===== */}
      {planilladosLiderModal.visible && 
       planilladosLiderModal.leader && 
       planilladosLiderModal.planillados && (
        <PlanilladosLiderNotification
          leader={planilladosLiderModal.leader}
          planillados={planilladosLiderModal.planillados}
          onClose={handlePlanilladosLiderClose}
          onConfirm={handlePlanilladosLiderConfirm}
        />
      )}

      {/* ===== AQUÍ PUEDES AGREGAR MÁS MODALES ===== */}
      {/* 
      {otroModal.visible && (
        <OtroModal
          data={otroModal.data}
          onClose={handleOtroModalClose}
        />
      )}
      */}
    </>
  );
});

ModalManager.displayName = 'ModalManager';

// =====================================
// ✅ HOOK PARA USAR MODAL MANAGER
// =====================================

import { useRef, useContext, createContext } from 'react';

interface ModalManagerContextValue {
  modalManagerRef: React.RefObject<ModalManagerRef | null>;
  showPlanilladosLiderModal: (leader: LeaderInfo, planillados: PlanilladoInfo[]) => void;
  closeAllModals: () => void;
}

const ModalManagerContext = createContext<ModalManagerContextValue | null>(null);

export const ModalManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const modalManagerRef = useRef<ModalManagerRef>(null);

  const showPlanilladosLiderModal = (leader: LeaderInfo, planillados: PlanilladoInfo[]) => {
    modalManagerRef.current?.showPlanilladosLiderModal(leader, planillados);
  };

  const closeAllModals = () => {
    modalManagerRef.current?.closeAllModals();
  };

  return (
    <ModalManagerContext.Provider value={{
      modalManagerRef,
      showPlanilladosLiderModal,
      closeAllModals
    }}>
      {children}
      <ModalManager ref={modalManagerRef} />
    </ModalManagerContext.Provider>
  );
};

export const useModalManager = () => {
  const context = useContext(ModalManagerContext);
  if (!context) {
    throw new Error('useModalManager debe ser usado dentro de ModalManagerProvider');
  }
  return context;
};

// =====================================
// ✅ COMPONENTE WRAPPER ALTERNATIVO
// =====================================

interface ModalManagerWrapperProps {
  children: React.ReactNode;
  onModalManagerReady?: (ref: ModalManagerRef) => void;
}

export const ModalManagerWrapper: React.FC<ModalManagerWrapperProps> = ({ 
  children, 
  onModalManagerReady 
}) => {
  const modalManagerRef = useRef<ModalManagerRef>(null);

  React.useEffect(() => {
    if (modalManagerRef.current && onModalManagerReady) {
      onModalManagerReady(modalManagerRef.current);
    }
  }, [onModalManagerReady]);

  return (
    <div className="modal-manager-wrapper">
      {children}
      <ModalManager ref={modalManagerRef} />
    </div>
  );
};

// =====================================
// ✅ UTILIDADES ADICIONALES
// =====================================

/**
 * Hook para escuchar eventos de modales
 */
export const useModalEvents = () => {
  React.useEffect(() => {
    const handlePlanilladosRelacionados = (event: CustomEvent) => {
      console.log('🎉 Evento: Planillados relacionados', event.detail);
      // Aquí puedes manejar el evento, por ejemplo:
      // - Actualizar estado global
      // - Hacer una llamada a la API para actualizar datos
      // - Mostrar una notificación de éxito
    };

    window.addEventListener('planillados-relacionados', handlePlanilladosRelacionados as EventListener);

    return () => {
      window.removeEventListener('planillados-relacionados', handlePlanilladosRelacionados as EventListener);
    };
  }, []);
};

/**
 * Función de utilidad para mostrar modal desde cualquier parte
 */
export const showPlanilladosLiderModalGlobal = (leader: LeaderInfo, planillados: PlanilladoInfo[]) => {
  const event = new CustomEvent('show-planillados-lider-modal', {
    detail: { leader, planillados }
  });
  window.dispatchEvent(event);
};

/**
 * Hook para manejar el evento global de mostrar modal
 */
export const useGlobalModalEvents = (modalManagerRef: React.RefObject<ModalManagerRef | null>) => {
  React.useEffect(() => {
    const handleShowPlanilladosModal = (event: CustomEvent) => {
      const { leader, planillados } = event.detail;
      modalManagerRef.current?.showPlanilladosLiderModal(leader, planillados);
    };

    window.addEventListener('show-planillados-lider-modal', handleShowPlanilladosModal as EventListener);

    return () => {
      window.removeEventListener('show-planillados-lider-modal', handleShowPlanilladosModal as EventListener);
    };
  }, [modalManagerRef]);
};