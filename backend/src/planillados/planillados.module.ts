// backend/src/planillados/planillados.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanilladosService } from './planillados.service';
import { PlanilladosController } from './planillados.controller';
import { Planillado } from './entities/planillado.entity';
import { Leader } from '../leaders/entities/leader.entity';
import { Group } from '../groups/entities/group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Planillado, Leader, Group])
  ],
  controllers: [PlanilladosController],
  providers: [PlanilladosService],
  exports: [PlanilladosService], // Para usar en otros módulos
})
export class PlanilladosModule {}