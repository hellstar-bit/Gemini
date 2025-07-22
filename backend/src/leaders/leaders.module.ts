// backend/src/leaders/leaders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadersService } from './leaders.service';
import { LeadersController } from './leaders.controller';
import { Leader } from './entities/leader.entity';
import { Group } from '../groups/entities/group.entity';
import { Planillado } from 'src/planillados/entities/planillado.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Leader, Group , Planillado])
  ],
  controllers: [LeadersController],
  providers: [LeadersService],
  exports: [LeadersService],
})
export class LeadersModule {}