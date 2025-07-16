import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS para el frontend
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  
  // Prefijo global para API
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 GEMINI Backend corriendo en: http://localhost:3000/api`);
}
bootstrap();