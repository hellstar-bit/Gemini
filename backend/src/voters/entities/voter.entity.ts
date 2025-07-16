// backend/src/voters/entities/voter.entity.ts - TIPOS CORREGIDOS
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Leader } from '../../leaders/entities/leader.entity';

@Entity('voters')
export class Voter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  cedula: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string; // ✅ CORREGIDO: opcional

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string; // ✅ CORREGIDO: opcional

  @Column({ type: 'text', nullable: true })
  address?: string; // ✅ CORREGIDO: opcional

  @Column({ type: 'varchar', length: 100, nullable: true })
  neighborhood?: string; // ✅ CORREGIDO: opcional

  @Column({ type: 'varchar', length: 100, nullable: true })
  municipality?: string; // ✅ CORREGIDO: opcional

  @Column({ type: 'varchar', length: 50, nullable: true })
  votingPlace?: string; // ✅ CORREGIDO: opcional

  @Column({ type: 'date', nullable: true })
  birthDate?: Date; // ✅ CORREGIDO: opcional

  @Column({ type: 'enum', enum: ['M', 'F', 'Other'], nullable: true })
  gender?: string; // ✅ CORREGIDO: opcional

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: ['committed', 'potential', 'undecided', 'opposed'], default: 'potential' })
  commitment: string;

  @Column({ name: 'leader_id', nullable: true })
  leaderId?: number; // ✅ CORREGIDO: opcional

  @ManyToOne(() => Leader, leader => leader.voters, { nullable: true }) // ✅ CORREGIDO: nullable
  @JoinColumn({ name: 'leader_id' })
  leader?: Leader; // ✅ CORREGIDO: opcional

  @Column({ type: 'text', nullable: true })
  notes?: string; // ✅ CORREGIDO: opcional

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}