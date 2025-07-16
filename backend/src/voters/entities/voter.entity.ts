// backend/src/voters/entities/voter.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Leader } from '../../leaders/entities/leader.entity';

@Entity('voters')
@Index(['cedula'], { unique: true })
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
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  neighborhood: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  municipality: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  votingPlace: string; // Mesa de votación

  @Column({ type: 'date', nullable: true })
  birthDate: Date | null;

  @Column({ type: 'enum', enum: ['M', 'F', 'Other'], nullable: true })
  gender: string;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: ['committed', 'potential', 'undecided', 'opposed'], default: 'potential' })
  commitment: string; // Nivel de compromiso

  @Column({ name: 'leader_id', nullable: true })
  leaderId: number;

  @ManyToOne(() => Leader, leader => leader.voters)
  @JoinColumn({ name: 'leader_id' })
  leader: Leader;

  @Column({ type: 'text', nullable: true })
  notes: string; // Notas adicionales

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}