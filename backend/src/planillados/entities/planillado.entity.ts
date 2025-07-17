// backend/src/planillados/entities/planillado.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Leader } from '../../leaders/entities/leader.entity';
import { Group } from '../../groups/entities/group.entity';

@Entity('planillados')
export class Planillado {
  @PrimaryGeneratedColumn()
  id: number;

  // ✅ DATOS PERSONALES
  @Column({ type: 'varchar', length: 20, unique: true })
  cedula: string;

  @Column({ type: 'varchar', length: 150 })
  nombres: string;

  @Column({ type: 'varchar', length: 150 })
  apellidos: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  celular?: string;

  @Column({ type: 'text', nullable: true })
  direccion?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  barrioVive?: string; // ✅ Barrio donde vive

  @Column({ type: 'date', nullable: true })
  fechaExpedicion?: Date; // ✅ Fecha de expedición

  // ✅ DATOS DE VOTACIÓN
  @Column({ type: 'varchar', length: 100, nullable: true })
  departamentoVotacion?: string; // ✅ Departamento de votación

  @Column({ type: 'varchar', length: 100, nullable: true })
  municipioVotacion?: string; // ✅ Municipio de votación

  @Column({ type: 'text', nullable: true })
  direccionVotacion?: string; // ✅ Dirección de votación

  @Column({ type: 'varchar', length: 50, nullable: true })
  zonaPuesto?: string; // ✅ Zona y puesto

  @Column({ type: 'varchar', length: 20, nullable: true })
  mesa?: string; // ✅ Mesa de votación

  // ✅ ESTADO Y CLASIFICACIÓN
  @Column({ type: 'enum', enum: ['verificado', 'pendiente'], default: 'pendiente' })
  estado: 'verificado' | 'pendiente'; // ✅ Solo estos dos estados

  @Column({ type: 'boolean', default: false })
  esEdil: boolean; // ✅ Si es edil o no

  @Column({ type: 'boolean', default: true })
  actualizado: boolean; // ✅ Estado de actualización

  // ✅ RELACIONES
  @Column({ name: 'leader_id', nullable: true })
  liderId?: number;

  @ManyToOne(() => Leader, leader => leader.planillados, { nullable: true })
  @JoinColumn({ name: 'leader_id' })
  lider?: Leader;

  @Column({ name: 'group_id', nullable: true })
  grupoId?: number;

  @ManyToOne(() => Group, group => group.planillados, { nullable: true })
  @JoinColumn({ name: 'group_id' })
  grupo?: Group;

  // ✅ DATOS ADICIONALES PARA ANÁLISIS
  @Column({ type: 'date', nullable: true })
  fechaNacimiento?: Date; // Para análisis por edad

  @Column({ type: 'enum', enum: ['M', 'F', 'Otro'], nullable: true })
  genero?: 'M' | 'F' | 'Otro'; // Para análisis por género

  @Column({ type: 'text', nullable: true })
  notas?: string;

  // ✅ TIMESTAMPS
  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;

  // ✅ CAMPOS CALCULADOS (Getters)
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
    if (!edad) return 'Sin definir';
    if (edad < 25) return '18-24';
    if (edad < 35) return '25-34';
    if (edad < 45) return '35-44';
    if (edad < 55) return '45-54';
    if (edad < 65) return '55-64';
    return '65+';
  }
}

// ✅ DTO para crear/actualizar planillado
export interface CreatePlanilladoDto {
  cedula: string;
  nombres: string;
  apellidos: string;
  celular?: string;
  direccion?: string;
  barrioVive?: string;
  fechaExpedicion?: Date;
  departamentoVotacion?: string;
  municipioVotacion?: string;
  direccionVotacion?: string;
  zonaPuesto?: string;
  mesa?: string;
  esEdil?: boolean;
  liderId?: number;
  grupoId?: number;
  fechaNacimiento?: Date;
  genero?: 'M' | 'F' | 'Otro';
  notas?: string;
}

// ✅ DTO para filtros y búsqueda
export interface PlanilladoFiltersDto {
  buscar?: string; // Búsqueda general
  estado?: 'verificado' | 'pendiente';
  barrioVive?: string;
  liderId?: number;
  grupoId?: number;
  esEdil?: boolean;
  genero?: 'M' | 'F' | 'Otro';
  rangoEdad?: string;
  municipioVotacion?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  actualizado?: boolean;
}

// ✅ DTO para estadísticas
export interface PlanilladosStatsDto {
  total: number;
  verificados: number;
  pendientes: number;
  ediles: number;
  porBarrio: Record<string, number>;
  porGenero: Record<string, number>;
  porEdad: Record<string, number>;
  porLider: Record<string, number>;
  porGrupo: Record<string, number>;
  nuevosHoy: number;
  nuevosEstaSemana: number;
  actualizadosHoy: number;
}