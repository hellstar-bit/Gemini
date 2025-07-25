// backend/src/planillados/entities/planillado.entity.ts - CORREGIDO

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
// ✅ ELIMINAR: @Index(['cedula'], { unique: true }) - Ya está definido en la columna
@Index(['cedulaLiderPendiente']) // ✅ MANTENER - Índice para búsquedas rápidas
@Index(['estado']) // ✅ NUEVO - Para filtros por estado
@Index(['esEdil']) // ✅ NUEVO - Para filtros por ediles
@Index(['municipioVotacion']) // ✅ NUEVO - Para filtros geográficos
export class Planillado {
  @PrimaryGeneratedColumn()
  id: number;

  // =====================================
  // DATOS PERSONALES
  // =====================================
  @Column({ type: 'varchar', length: 20, unique: true }) // ✅ MANTENER unique aquí
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
  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;

  // =====================================
  // CAMPOS CALCULADOS (NO PERSISTIDOS)
  // =====================================
  get nombreCompleto(): string {
    return `${this.nombres} ${this.apellidos}`;
  }

  get edad(): number | undefined {
    if (!this.fechaNacimiento) return undefined;
    const hoy = new Date();
    const nacimiento = new Date(this.fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  get rangoEdad(): string {
    const edad = this.edad;
    if (!edad) return 'No definido';
    if (edad < 18) return 'Menor de edad';
    if (edad <= 25) return '18-25';
    if (edad <= 35) return '26-35';
    if (edad <= 45) return '36-45';
    if (edad <= 55) return '46-55';
    if (edad <= 65) return '56-65';
    return 'Más de 65';
  }
}