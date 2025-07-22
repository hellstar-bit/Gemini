// backend/src/import/import.module.ts - ACTUALIZADO CON PLANILLADOS

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { Leader } from '../leaders/entities/leader.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { Group } from '../groups/entities/group.entity';
import { Planillado } from '../planillados/entities/planillado.entity'; // ✅ NUEVO

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Leader, 
      Candidate, 
      Group,
      Planillado // ✅ NUEVO - Agregar entidad Planillado
    ])
  ],
  controllers: [ImportController],
  providers: [ImportService],
  exports: [ImportService],
})
export class ImportModule {}