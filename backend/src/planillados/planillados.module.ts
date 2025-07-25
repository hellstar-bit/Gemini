// backend/src/planillados/planillados.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanilladosService } from './planillados.service';
import { PlanilladosController } from './planillados.controller';
import { Planillado } from './entities/planillado.entity';
import { Leader } from '../leaders/entities/leader.entity';
import { Group } from '../groups/entities/group.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([Planillado, Leader, Group]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [PlanilladosController],
  providers: [PlanilladosService],
  exports: [PlanilladosService],
})
export class PlanilladosModule {}