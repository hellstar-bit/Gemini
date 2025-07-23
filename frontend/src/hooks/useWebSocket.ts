// frontend/src/hooks/useWebSocket.ts - SIN JSX - COMPATIBLE CON erasableSyntaxOnly

import { useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/slices/appSlice';
import io from 'socket.io-client';

// =====================================
// ✅ INTERFACES
// =====================================

interface WebSocketConfig {
  url?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

interface ModalManagerRef {
  showPlanilladosLiderModal: (leader: any, planillados: any[]) => void;
}

interface CustomNotification {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  persistent?: boolean;
  duration?: number;
  actions?: Array<{
    id: string;
    label: string;
    action: () => void;
  }>;
}

interface WebSocketContextValue {
  isConnected: boolean;
  sendMessage: (event: string, data: any) => void;
  registerModalManager: (modalManager: ModalManagerRef) => void;
}

// =====================================
// ✅ HOOK PRINCIPAL
// =====================================

export const useWebSocket = (config: WebSocketConfig = {}) => {
  const dispatch = useDispatch();
  const socketRef = useRef<any>(null);
  const modalManagerRef = useRef<ModalManagerRef | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const {
  url = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:3000',
  autoConnect = true,
  reconnection = true,
  reconnectionDelay = 3000
} = config;

  // =====================================
  // CONEXIÓN Y DESCONEXIÓN
  // =====================================

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('🔌 WebSocket ya está conectado');
      return;
    }

    console.log('🔌 Conectando WebSocket...', url);
    
    const socketOptions: any = {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  timeout: 10000,
  forceNew: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
};

socketRef.current = io(`${url}/notifications`, socketOptions);

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('✅ WebSocket conectado:', socket.id);
      dispatch(addNotification({
        type: 'success',
        title: 'Conexión establecida',
        message: 'Sistema de notificaciones activo',
        duration: 3000
      }));
    });

    socket.on('connection-success', (data: any) => {
      console.log('✅ Confirmación de conexión:', data);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('🔌 WebSocket desconectado:', reason);
      if (reason === 'io server disconnect') {
        dispatch(addNotification({
          type: 'warning',
          title: 'Conexión perdida',
          message: 'Se perdió la conexión con el servidor. Reintentando...',
          duration: 5000
        }));
        if (reconnection) {
          attemptReconnect();
        }
      }
    });

    socket.on('connect_error', (error: any) => {
      console.error('❌ Error de conexión WebSocket:', error);
      dispatch(addNotification({
        type: 'error',
        title: 'Error de conexión',
        message: 'No se pudo conectar al sistema de notificaciones',
        duration: 5000
      }));
      if (reconnection) {
        attemptReconnect();
      }
    });

    socket.on('leader.created.with.pending.planillados', handleLeaderCreatedWithPendingPlanillados);
    socket.on('planillados.relacionados.success', handlePlanilladosRelacionadosSuccess);
    socket.on('planillados-action-response', handlePlanilladosActionResponse);

    socket.on('connection-stats', (stats: any) => {
      console.log('📊 Estadísticas de conexión:', stats);
    });

  }, [url, dispatch, reconnection]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      console.log('🔌 Desconectando WebSocket...');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const attemptReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) return;

    reconnectTimeoutRef.current = window.setTimeout(() => {
      console.log('🔄 Intentando reconectar WebSocket...');
      connect();
      reconnectTimeoutRef.current = null;
    }, reconnectionDelay);
  }, [connect, reconnectionDelay]);

  // =====================================
  // MANEJADORES DE EVENTOS
  // =====================================

  const handleLeaderCreatedWithPendingPlanillados = useCallback((payload: any) => {
    console.log('📢 Recibido: Líder con planillados pendientes', payload);

    const { leader, planilladosPendientes, notification } = payload;

    const customNotification: CustomNotification = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      persistent: notification.persistent,
      duration: 0,
      actions: [
        {
          id: 'view-planillados',
          label: 'Ver y relacionar',
          action: () => {
            if (modalManagerRef.current?.showPlanilladosLiderModal) {
              modalManagerRef.current.showPlanilladosLiderModal(leader, planilladosPendientes);
            } else {
              console.warn('⚠️ Modal manager no está registrado');
            }
          }
        },
        {
          id: 'ignore',
          label: 'Ignorar',
          action: () => {
            socketRef.current?.emit('planillados-action', {
              notificationId: notification.id,
              action: 'ignore',
              leaderId: leader.id
            });
          }
        }
      ]
    };

    dispatch(addNotification(customNotification));
  }, [dispatch]);

  const handlePlanilladosRelacionadosSuccess = useCallback((payload: any) => {
    console.log('📢 Recibido: Planillados relacionados exitosamente', payload);

    const { notification } = payload;

    dispatch(addNotification({
      type: notification.type,
      title: notification.title,
      message: notification.message,
      persistent: notification.persistent,
      duration: notification.duration
    }));
  }, [dispatch]);

  const handlePlanilladosActionResponse = useCallback((response: any) => {
    console.log('📝 Respuesta de acción:', response);

    if (response.success) {
      dispatch(addNotification({
        type: 'info',
        title: 'Acción procesada',
        message: response.message,
        duration: 3000
      }));
    }
  }, [dispatch]);

  // =====================================
  // MÉTODOS PÚBLICOS
  // =====================================

  const registerModalManager = useCallback((modalManager: ModalManagerRef) => {
    modalManagerRef.current = modalManager;
    console.log('✅ Modal manager registrado');
  }, []);

  const sendMessage = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
      console.log(`📤 Mensaje enviado: ${event}`, data);
    } else {
      console.warn('⚠️ WebSocket no está conectado');
    }
  }, []);

  const getConnectionStats = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('get-connection-stats');
    }
  }, []);

  const isConnected = socketRef.current?.connected || false;

  // =====================================
  // EFECTOS
  // =====================================

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, autoConnect]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !socketRef.current?.connected) {
        console.log('📄 Página visible, reconectando WebSocket...');
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connect]);

  return {
    isConnected,
    socket: socketRef.current,
    connect,
    disconnect,
    sendMessage,
    getConnectionStats,
    registerModalManager,
    connectionId: socketRef.current?.id || null
  };
};

// =====================================
// ✅ HOOK ESPECÍFICO PARA PLANILLADOS
// =====================================

export const usePlanilladosWebSocket = () => {
  const webSocket = useWebSocket();

  const notifyPlanilladosRelacionados = useCallback((data: {
    liderId: number;
    liderNombre: string;
    planilladosCount: number;
    relacionadosPor: string;
  }) => {
    webSocket.sendMessage('planillados.relacionados.success', {
      ...data,
      timestamp: new Date().toISOString()
    });
  }, [webSocket]);

  const respondToPlanilladosNotification = useCallback((data: {
    notificationId: string;
    action: 'view' | 'ignore';
    leaderId?: number;
    planilladoIds?: number[];
  }) => {
    webSocket.sendMessage('planillados-action', data);
  }, [webSocket]);

  return {
    ...webSocket,
    notifyPlanilladosRelacionados,
    respondToPlanilladosNotification
  };
};

// =====================================
// ✅ CONTEXT SIN JSX
// =====================================

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export const useWebSocketContext = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext debe ser usado dentro de WebSocketProvider');
  }
  return context;
};

// ✅ FUNCIÓN HELPER PARA CREAR PROVIDER (sin JSX)
export const createWebSocketProvider = () => {
  return {
    context: WebSocketContext,
    useContext: useWebSocketContext,
    createProvider: (children: any) => {
      const webSocket = useWebSocket();
      return {
        Provider: WebSocketContext.Provider,
        props: {
          value: {
            isConnected: webSocket.isConnected,
            sendMessage: webSocket.sendMessage,
            registerModalManager: webSocket.registerModalManager
          },
          children
        }
      };
    }
  };
};