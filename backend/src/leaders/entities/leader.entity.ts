// backend/src/leaders/entities/leader.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Group } from '../../groups/entities/group.entity';
import { Planillado } from '../../planillados/entities/planillado.entity';

@Entity('leaders')
export class Leader {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 20 })
  cedula: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 150, nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ length: 100, nullable: true })
  neighborhood?: string;

  @Column({ length: 100, nullable: true })
  municipality?: string;

  @Column({ type: 'date', nullable: true })
  birthDate?: Date;

  @Column({ 
    type: 'enum', 
    enum: ['M', 'F', 'Other'], 
    nullable: true 
  })
  gender?: 'M' | 'F' | 'Other';

  @Column({ type: 'int', default: 0 })
  meta: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  groupId?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // =============================================
  // ✅ RELACIONES
  // =============================================

  // Relación Many-to-One con Group
  @ManyToOne(() => Group, group => group.leaders, { 
    nullable: true,
    onDelete: 'SET NULL' 
  })
  @JoinColumn({ name: 'groupId' })
  group?: Group;

  // ✅ Relación One-to-Many con Planillado
  @OneToMany(() => Planillado, planillado => planillado.lider)
  planillados: Planillado[];

  // =============================================
  // ✅ PROPIEDADES CALCULADAS (sin getter - para evitar conflictos)
  // =============================================

  // ✅ Esta propiedad será establecida por TypeORM automáticamente
  planilladosCount?: number;

  // ✅ Método para obtener nombre completo (getter regular)
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // ✅ Método para obtener el conteo de planillados cuando se necesite manualmente
  getPlanilladosCountSync(): number {
    return this.planillados?.length || 0;
  }
}