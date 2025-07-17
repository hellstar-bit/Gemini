// backend/src/voters/entities/voter.entity.ts - ACTUALIZADA MANTENIENDO COMPATIBILIDAD
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Leader } from '../../leaders/entities/leader.entity';

@Entity('voters')
export class Voter {
  @PrimaryGeneratedColumn()
  id: number;

  // ✅ CAMPOS OBLIGATORIOS (mantengo nombres originales para compatibilidad)
  @Column({ type: 'varchar', length: 20, unique: true })
  cedula: string;

  @Column({ type: 'varchar', length: 150 }) // ✅ Aumentado para nombres completos
  firstName: string; // En la importación mapearemos "nombres" -> firstName

  @Column({ type: 'varchar', length: 150 }) // ✅ Aumentado para apellidos completos  
  lastName: string; // En la importación mapearemos "apellidos" -> lastName

  // ✅ CAMPOS DE CONTACTO
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string; // En la importación mapearemos "celular" -> phone

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  // ✅ CAMPOS DE UBICACIÓN
  @Column({ type: 'text', nullable: true })
  address?: string; // En la importación mapearemos "direccion" -> address

  @Column({ type: 'varchar', length: 100, nullable: true })
  neighborhood?: string; // En la importación mapearemos "barrio" -> neighborhood

  @Column({ type: 'varchar', length: 100, nullable: true })
  municipality?: string; // En la importación mapearemos "municipio" -> municipality

  // ✅ NUEVO CAMPO - FECHA DE EXPEDICIÓN
  @Column({ type: 'date', nullable: true })
  expeditionDate?: Date; // ✅ NUEVO: fecha de expedición de la cédula

  // ✅ CAMPOS ADICIONALES OPCIONALES
  @Column({ type: 'varchar', length: 50, nullable: true })
  votingPlace?: string;

  @Column({ type: 'date', nullable: true })
  birthDate?: Date;

  @Column({ type: 'enum', enum: ['M', 'F', 'Other'], nullable: true })
  gender?: string;

  // ✅ CAMPOS DEL SISTEMA
  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: ['committed', 'potential', 'undecided', 'opposed'], default: 'potential' })
  commitment: string;

  @Column({ name: 'leader_id', nullable: true })
  leaderId?: number;

  @ManyToOne(() => Leader, leader => leader.voters, { nullable: true })
  @JoinColumn({ name: 'leader_id' })
  leader?: Leader;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ✅ DTO para importación que mapea tu formato específico
export interface ImportVoterDto {
  cedula: string;
  firstName: string;  // Mapea desde "nombres" del Excel
  lastName: string;   // Mapea desde "apellidos" del Excel  
  phone?: string;     // Mapea desde "celular" del Excel
  address?: string;   // Mapea desde "direccion" del Excel
  neighborhood?: string; // Mapea desde "barrio" del Excel
  expeditionDate?: string; // ✅ NUEVO: mapea desde "fecha de expedicion" del Excel
  email?: string;
  municipality?: string;
  votingPlace?: string;
  birthDate?: string;
  gender?: 'M' | 'F' | 'Other';
  notes?: string;
}

// ✅ Función auxiliar para mapear los datos de Excel a la entidad
export function mapExcelDataToVoter(excelRow: Record<string, any>, fieldMappings: Record<string, string>): Partial<Voter> {
  const voter: Partial<Voter> = {};

  // Mapear cada campo según el mapping configurado
  Object.entries(fieldMappings).forEach(([excelColumn, entityField]) => {
    const value = excelRow[excelColumn];
    
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      const cleanValue = String(value).trim();
      
      switch (entityField) {
        case 'cedula':
          voter.cedula = cleanValue.replace(/\D/g, ''); // Solo números
          break;
          
        case 'firstName':
          voter.firstName = capitalizeWords(cleanValue);
          break;
          
        case 'lastName':
          voter.lastName = capitalizeWords(cleanValue);
          break;
          
        case 'phone':
          voter.phone = cleanValue.replace(/[\s\-\(\)]/g, ''); // Limpiar formato
          break;
          
        case 'email':
          voter.email = cleanValue.toLowerCase();
          break;
          
        case 'address':
          voter.address = cleanValue;
          break;
          
        case 'neighborhood':
          voter.neighborhood = capitalizeWords(cleanValue);
          break;
          
        case 'municipality':
          voter.municipality = capitalizeWords(cleanValue);
          break;
          
        case 'expeditionDate':
          voter.expeditionDate = parseDate(cleanValue);
          break;
          
        case 'birthDate':
          voter.birthDate = parseDate(cleanValue);
          break;
          
        case 'gender':
          voter.gender = normalizeGender(cleanValue);
          break;
          
        case 'votingPlace':
          voter.votingPlace = cleanValue;
          break;
          
        case 'notes':
          voter.notes = cleanValue;
          break;
      }
    }
  });

  return voter;
}

// ✅ Funciones auxiliares para limpieza de datos
function capitalizeWords(text: string): string {
  return text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function normalizeGender(value: string): string {
  const normalized = value.toLowerCase().trim();
  
  if (['m', 'masculino', 'male', 'hombre'].includes(normalized)) {
    return 'M';
  } else if (['f', 'femenino', 'female', 'mujer'].includes(normalized)) {
    return 'F';
  } else {
    return 'Other';
  }
}

function parseDate(dateString: string): Date | undefined {
  if (!dateString) return undefined;
  
  const cleanDate = dateString.trim();
  
  // Intentar diferentes formatos
  const formats = [
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/YYYY
    /^(\d{2})-(\d{2})-(\d{4})$/,  // DD-MM-YYYY
    /^(\d{4})-(\d{2})-(\d{2})$/   // YYYY-MM-DD
  ];
  
  for (const format of formats) {
    const match = cleanDate.match(format);
    if (match) {
      if (format === formats[2]) { // YYYY-MM-DD
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      } else { // DD/MM/YYYY o DD-MM-YYYY
        return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      }
    }
  }
  
  // Si no coincide con ningún formato, intentar parsearlo directamente
  const parsed = new Date(cleanDate);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}