// backend/src/main.ts - CORS CORREGIDO

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS para el frontend - ✅ CAMBIAR AQUÍ
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Frontend en Vite
    credentials: true,
  });
  
  // Prefijo global para API
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 GEMINI Backend corriendo en: http://localhost:${port}/api`);
  console.log(`🔌 WebSocket disponible en: http://localhost:${port}`);
  console.log(`🌐 CORS configurado para: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
}
bootstrap();