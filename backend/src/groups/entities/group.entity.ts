// backend/src/groups/entities/group.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Candidate } from '../../candidates/entities/candidate.entity';
import { Leader } from '../../leaders/entities/leader.entity';
import { Planillado } from '../../planillados/entities/planillado.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  zone?: string; // Zona geográfica de operación

  @Column({ type: 'int', default: 0 })
  meta: number; // Meta de votantes

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relación con candidato
  @Column({ name: 'candidate_id' })
  candidateId: number;

  @ManyToOne(() => Candidate, candidate => candidate.groups)
  @JoinColumn({ name: 'candidate_id' })
  candidate: Candidate;

  // Relaciones con líderes y planillados
  @OneToMany(() => Leader, leader => leader.group)
  leaders: Leader[];

  @OneToMany(() => Planillado, planillado => planillado.grupo)
  planillados: Planillado[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Campos calculados
  leadersCount?: number;
  votersCount?: number;
  planilladosCount?: number;
}

