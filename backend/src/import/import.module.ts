// backend/src/import/import.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { Voter } from '../voters/entities/voter.entity';
import { Leader } from '../leaders/entities/leader.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { Group } from '../groups/entities/group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Voter, Leader, Candidate, Group])
  ],
  controllers: [ImportController],
  providers: [ImportService],
  exports: [ImportService],
})
export class ImportModule {}