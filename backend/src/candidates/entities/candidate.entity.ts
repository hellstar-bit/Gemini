// backend/src/candidates/entities/candidate.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Group } from '../../groups/entities/group.entity';

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'int', default: 0 })
  meta: number; // Meta de votos

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  position?: string; // Cargo al que aspira

  @Column({ type: 'varchar', length: 100, nullable: true })
  party?: string; // Partido político

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relación con grupos
  @OneToMany(() => Group, group => group.candidate)
  groups: Group[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Campos calculados
  groupsCount?: number;
  leadersCount?: number;
  votersCount?: number;
}