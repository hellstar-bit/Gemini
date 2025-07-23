// backend/src/leaders/leaders.module.ts - CORREGIDO

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadersService } from './leaders.service';
import { LeadersController } from './leaders.controller';
import { Leader } from './entities/leader.entity';
import { Group } from '../groups/entities/group.entity';
import { Planillado } from '../planillados/entities/planillado.entity';
import { PlanilladosModule } from '../planillados/planillados.module'; // ✅ AGREGAR IMPORT

@Module({
  imports: [
    TypeOrmModule.forFeature([Leader, Group, Planillado]),
    PlanilladosModule, // ✅ AGREGAR MÓDULO
  ],
  controllers: [LeadersController],
  providers: [LeadersService],
  exports: [LeadersService],
})
export class LeadersModule {}