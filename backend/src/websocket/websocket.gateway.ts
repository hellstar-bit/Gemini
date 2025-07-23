// backend/src/websocket/websocket.gateway.ts

import { WebSocketServer,
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets'; 
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications', // Namespace específico para notificaciones
})
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('WebsocketGateway');
  private connectedClients: Map<string, Socket> = new Map();

  // =====================================
  // EVENTOS DEL GATEWAY
  // =====================================

  afterInit(server: Server) {
    this.logger.log('✅ WebSocket Gateway inicializado');
  }

  handleConnection(client: Socket) {
    const clientId = client.id;
    this.connectedClients.set(clientId, client);
    this.logger.log(`🔌 Cliente conectado: ${clientId} (Total: ${this.connectedClients.size})`);
    
    // Enviar confirmación de conexión
    client.emit('connection-success', {
      message: 'Conectado al sistema de notificaciones GEMINI',
      clientId,
      timestamp: new Date().toISOString()
    });
  }

  handleDisconnect(client: Socket) {
    const clientId = client.id;
    this.connectedClients.delete(clientId);
    this.logger.log(`🔌 Cliente desconectado: ${clientId} (Total: ${this.connectedClients.size})`);
  }

  // =====================================
  // ✅ EVENTOS DE PLANILLADOS-LÍDER
  // =====================================

  /**
   * Escuchar evento cuando se crea un líder con planillados pendientes
   */
  @OnEvent('leader.created.with.pending.planillados')
  handleLeaderCreatedWithPendingPlanillados(payload: {
    leader: {
      id: number;
      cedula: string;
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
    };
    planilladosPendientes: Array<{
      id: number;
      cedula: string;
      nombres: string;
      apellidos: string;
      cedulaLiderPendiente: string;
    }>;
    count: number;
    timestamp: string;
  }) {
    this.logger.log(`📢 Emitiendo notificación: Líder ${payload.leader.firstName} ${payload.leader.lastName} tiene ${payload.count} planillados pendientes`);
    
    // Emitir a todos los clientes conectados
    this.server.emit('leader.created.with.pending.planillados', {
      type: 'leader_pending_planillados',
      ...payload,
      notification: {
        id: `leader-${payload.leader.id}-${Date.now()}`,
        type: 'info',
        title: 'Planillados pendientes encontrados',
        message: `Se encontraron ${payload.count} planillado(s) esperando relación con ${payload.leader.firstName} ${payload.leader.lastName}`,
        persistent: true,
        priority: 'high',
        actions: [
          {
            id: 'view-planillados',
            label: 'Ver y relacionar',
            type: 'primary'
          },
          {
            id: 'ignore',
            label: 'Ignorar',
            type: 'secondary'
          }
        ]
      }
    });
  }

  /**
   * Escuchar evento cuando se relacionan planillados con líder
   */
  @OnEvent('planillados.relacionados.success')
  handlePlanilladosRelacionadosSuccess(payload: {
    liderId: number;
    liderNombre: string;
    planilladosCount: number;
    relacionadosPor: string;
    timestamp: string;
  }) {
    this.logger.log(`📢 Emitiendo notificación: ${payload.planilladosCount} planillados relacionados con líder ${payload.liderNombre}`);
    
    this.server.emit('planillados.relacionados.success', {
      type: 'planillados_relacionados',
      ...payload,
      notification: {
        id: `relacionados-${payload.liderId}-${Date.now()}`,
        type: 'success',
        title: 'Planillados relacionados exitosamente',
        message: `${payload.planilladosCount} planillado(s) se relacionaron con ${payload.liderNombre}`,
        persistent: false,
        duration: 5000
      }
    });
  }

  // =====================================
  // MENSAJES SUSCRITOS
  // =====================================

  /**
   * Manejar respuesta del cliente a notificación de planillados pendientes
   */
  @SubscribeMessage('planillados-action')
  handlePlanilladosAction(
    client: Socket,
    payload: {
      notificationId: string;
      action: 'view' | 'ignore';
      leaderId?: number;
      planilladoIds?: number[];
    }
  ) {
    this.logger.log(`📝 Cliente ${client.id} respondió a notificación: ${payload.action}`);
    
    if (payload.action === 'view') {
      // El cliente quiere ver los planillados - el frontend manejará esto
      client.emit('planillados-action-response', {
        success: true,
        action: 'view',
        message: 'Abriendo modal de planillados pendientes'
      });
    } else if (payload.action === 'ignore') {
      // El cliente ignora la notificación
      client.emit('planillados-action-response', {
        success: true,
        action: 'ignore',
        message: 'Notificación ignorada'
      });
    }
  }

  /**
   * Obtener estadísticas de conexiones
   */
  @SubscribeMessage('get-connection-stats')
  handleGetConnectionStats(client: Socket) {
    const stats = {
      connectedClients: this.connectedClients.size,
      clientId: client.id,
      serverTime: new Date().toISOString()
    };
    
    client.emit('connection-stats', stats);
    return stats;
  }

  // =====================================
  // MÉTODOS AUXILIARES
  // =====================================

  /**
   * Enviar notificación a un cliente específico
   */
  sendToClient(clientId: string, event: string, data: any) {
    const client = this.connectedClients.get(clientId);
    if (client) {
      client.emit(event, data);
      this.logger.log(`📤 Mensaje enviado a cliente ${clientId}: ${event}`);
    } else {
      this.logger.warn(`⚠️ Cliente ${clientId} no encontrado`);
    }
  }

  /**
   * Enviar notificación a todos los clientes
   */
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
    this.logger.log(`📢 Broadcast enviado: ${event} (${this.connectedClients.size} clientes)`);
  }

  /**
   * Obtener estadísticas del gateway
   */
  getStats() {
    return {
      connectedClients: this.connectedClients.size,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }
}