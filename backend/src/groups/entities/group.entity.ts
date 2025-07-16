// backend/src/groups/entities/group.entity.ts - CORREGIDA
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Candidate } from '../../candidates/entities/candidate.entity';
import { Leader } from '../../leaders/entities/leader.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  zone: string;

  @Column({ type: 'int', default: 0 })
  meta: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'candidate_id' })
  candidateId: number;

  @ManyToOne(() => Candidate, candidate => candidate.groups)
  @JoinColumn({ name: 'candidate_id' })
  candidate: Candidate;

  @OneToMany(() => Leader, leader => leader.group)
  leaders: Leader[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Campos calculados
  leadersCount?: number;
  votersCount?: number;
}