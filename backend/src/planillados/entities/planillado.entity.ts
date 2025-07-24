// backend/src/planillados/entities/planillado.entity.ts - ACTUALIZADO

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Leader } from '../../leaders/entities/leader.entity';
import { Group } from '../../groups/entities/group.entity';

@Entity('planillados')
@Index(['cedula'], { unique: true })
@Index(['cedulaLiderPendiente']) // ✅ NUEVO - Índice para búsquedas rápidas
export class Planillado {
  @PrimaryGeneratedColumn()
  id: number;

  // =====================================
  // DATOS PERSONALES
  // =====================================
  @Column({ type: 'varchar', length: 20, unique: true })
  cedula: string;

  @Column({ type: 'varchar', length: 100 })
  nombres: string;

  @Column({ type: 'varchar', length: 100 })
  apellidos: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  celular?: string;

  @Column({ type: 'text', nullable: true })
  direccion?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  barrioVive?: string;

  @Column({ type: 'date', nullable: true })
  fechaExpedicion?: Date;

  // =====================================
  // DATOS DE VOTACIÓN
  // =====================================
  @Column({ type: 'varchar', length: 100, nullable: true })
  departamentoVotacion?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  municipioVotacion?: string;

  @Column({ type: 'text', nullable: true })
  direccionVotacion?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  zonaPuesto?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  mesa?: string;

  // =====================================
  // ESTADO Y CLASIFICACIÓN
  // =====================================
  @Column({
    type: 'enum',
    enum: ['verificado', 'pendiente'],
    default: 'pendiente',
  })
  estado: 'verificado' | 'pendiente';

  @Column({ type: 'boolean', default: false })
  esEdil: boolean;

  @Column({ type: 'boolean', default: false })
  actualizado: boolean;

  // =====================================
  // RELACIONES
  // =====================================
  @Column({ nullable: true })
  liderId?: number;

  @ManyToOne(() => Leader, { nullable: true })
  @JoinColumn({ name: 'liderId' })
  lider?: Leader;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cedulaLiderPendiente?: string;

  @Column({ nullable: true })
  grupoId?: number;

  @ManyToOne(() => Group, { nullable: true })
  @JoinColumn({ name: 'grupoId' })
  grupo?: Group;


  // =====================================
  // DATOS ADICIONALES
  // =====================================
  @Column({ type: 'date', nullable: true })
  fechaNacimiento?: Date;

  @Column({
    type: 'enum',
    enum: ['M', 'F', 'Otro'],
    nullable: true,
  })
  genero?: 'M' | 'F' | 'Otro';

  @Column({ type: 'text', nullable: true })
  notas?: string;

  // =====================================
  // TIMESTAMPS
  // =====================================
  @CreateDateColumn({ name: 'fechaCreacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fechaActualizacion' })
  fechaActualizacion: Date;

  // =====================================
  // CAMPOS CALCULADOS (Virtual)
  // =====================================
  get nombreCompleto(): string {
    return `${this.nombres} ${this.apellidos}`;
  }

  get edad(): number | null {
    if (!this.fechaNacimiento) return null;
    
    const today = new Date();
    const birthDate = new Date(this.fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  get rangoEdad(): string {
    const edad = this.edad;
    if (!edad) return 'No especificado';
    
    if (edad >= 18 && edad <= 24) return '18-24';
    if (edad >= 25 && edad <= 34) return '25-34';
    if (edad >= 35 && edad <= 44) return '35-44';
    if (edad >= 45 && edad <= 54) return '45-54';
    if (edad >= 55 && edad <= 64) return '55-64';
    if (edad >= 65) return '65+';
    
    return 'No válido';
  }
}