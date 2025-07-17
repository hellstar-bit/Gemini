// backend/src/leaders/entities/leader.entity.ts - CORREGIDA (SIN @Index duplicados)
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Group } from '../../groups/entities/group.entity';
import { Voter } from '../../voters/entities/voter.entity';

@Entity('leaders')
export class Leader {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true }) // ✅ UNIQUE en lugar de @Index
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

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ type: 'enum', enum: ['M', 'F', 'Other'], nullable: true })
  gender: string;

  @Column({ type: 'int', default: 0 })
  meta: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'group_id' })
  groupId: number;

  @ManyToOne(() => Group, group => group.leaders)
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @OneToMany(() => Voter, voter => voter.leader)
  voters: Voter[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Campo calculado
  votersCount?: number;
    planillados: any;
}