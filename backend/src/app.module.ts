import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LeadersModule } from './leaders/leaders.module';
import { CandidatesModule } from './candidates/candidates.module';
import { GroupsModule } from './groups/groups.module';
import { ImportModule } from './import/import.module';
import { PlanilladosModule } from './planillados/planillados.module';
import { WebsocketModule } from './websocket/websocket.module'; // ✅ AGREGAR
import { EventEmitterModule } from '@nestjs/event-emitter';

// Entidades
import { User } from './users/entities/user.entity';
import { Leader } from './leaders/entities/leader.entity';
import { Candidate } from './candidates/entities/candidate.entity';
import { Group } from './groups/entities/group.entity';
import { Planillado } from './planillados/entities/planillado.entity';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      // Configuración opcional
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    // Configuración
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Base de datos
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [
          User, 
          Leader, 
          Candidate, 
          Group,
          Planillado
        ],
        synchronize: configService.get('NODE_ENV') !== 'production', // Solo en desarrollo
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    LeadersModule,
    CandidatesModule,
    GroupsModule,
    ImportModule,
    PlanilladosModule,
    WebsocketModule, // ✅ AGREGAR ESTE MÓDULO
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}