// backend/src/app.module.ts - Configuración MySQL sin conflictos
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ImportModule } from './import/import.module';

// Entities
import { User } from './users/entities/user.entity';
import { Candidate } from './candidates/entities/candidate.entity';
import { Group } from './groups/entities/group.entity';
import { Leader } from './leaders/entities/leader.entity';
import { Voter } from './voters/entities/voter.entity';
import { Location } from './locations/entities/location.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: parseInt(configService.get('DB_PORT', '3306'), 10),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_NAME', 'gemini'),
        entities: [User, Candidate, Group, Leader, Voter, Location],
        synchronize: configService.get('NODE_ENV') === 'development', // ✅ Solo en desarrollo
        logging: configService.get('NODE_ENV') === 'development',
        timezone: 'Z',
        charset: 'utf8mb4',
        retryAttempts: 3,
        retryDelay: 3000,
        autoLoadEntities: true,
        // ✅ Configuraciones para evitar conflictos de índices
        dropSchema: configService.get('NODE_ENV') === 'development' && configService.get('DROP_SCHEMA') === 'true',
        migrationsRun: false, // ✅ Deshabilitar migraciones automáticas
        cache: false, // ✅ Deshabilitar cache para evitar conflictos
        extra: {
          connectionLimit: 10,
          acquireTimeout: 60000,
          timeout: 60000,
        }
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ImportModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}