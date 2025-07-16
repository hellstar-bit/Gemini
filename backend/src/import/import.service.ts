// backend/src/import/import.service.ts - COMPLETAMENTE CORREGIDO
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as XLSX from 'xlsx';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { Voter } from '../voters/entities/voter.entity';
import { Leader } from '../leaders/entities/leader.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { Group } from '../groups/entities/group.entity';
import {
  ImportPreviewDto,
  ImportMappingDto,
  ImportResultDto,
  ImportErrorDto,
  BulkImportVoterDto,
  BulkImportLeaderDto,
  BulkImportCandidateDto,
  BulkImportGroupDto
} from './dto/import.dto';

@Injectable()
export class ImportService {
  constructor(
    @InjectRepository(Voter)
    private voterRepository: Repository<Voter>,
    @InjectRepository(Leader)
    private leaderRepository: Repository<Leader>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    private dataSource: DataSource,
  ) {}

  async previewFile(file: Express.Multer.File): Promise<ImportPreviewDto> {
    try {
      let data: any[] = [];
      let headers: string[] = [];

      if (file.mimetype.includes('excel') || file.filename.endsWith('.xlsx') || file.filename.endsWith('.xls')) {
        // Procesar Excel
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
        
        if (data.length > 0) {
          headers = Object.keys(data[0]);
        }
      } else if (file.mimetype.includes('csv') || file.filename.endsWith('.csv')) {
        // Procesar CSV
        data = await this.parseCSV(file.buffer);
        if (data.length > 0) {
          headers = Object.keys(data[0]);
        }
      } else {
        throw new BadRequestException('Tipo de archivo no soportado. Use Excel (.xlsx) o CSV (.csv)');
      }

      // Validaciones básicas
      const errors: string[] = [];
      const warnings: string[] = [];

      if (data.length === 0) {
        errors.push('El archivo está vacío o no contiene datos válidos');
      }

      if (data.length > 10000) {
        warnings.push(`El archivo contiene ${data.length} filas. Archivos grandes pueden tomar más tiempo en procesarse.`);
      }

      // Verificar headers comunes
      const commonHeaders = ['cedula', 'nombre', 'apellido', 'telefono', 'email'];
      const foundHeaders = headers.filter(h => 
        commonHeaders.some(ch => h.toLowerCase().includes(ch))
      );

      if (foundHeaders.length === 0) {
        warnings.push('No se detectaron columnas comunes (cédula, nombre, apellido, etc.). Verifique el formato.');
      }

      const result: ImportPreviewDto = {
        data: data,
        headers,
        totalRows: data.length,
        sampleRows: data.slice(0, 5),
        errors,
        warnings
      };

      return result;
    } catch (error) {
      throw new BadRequestException(`Error procesando archivo: ${error.message}`);
    }
  }

  async importVoters(mappingDto: ImportMappingDto): Promise<ImportResultDto> {
    const startTime = Date.now();
    const errors: ImportErrorDto[] = [];
    let successCount = 0;
    let errorCount = 0;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (let i = 0; i < mappingDto.previewData.length; i++) {
        const row = mappingDto.previewData[i];
        const rowNumber = i + 1;

        try {
          // Mapear datos según configuración
          const voterData: BulkImportVoterDto = this.mapRowToVoter(row, mappingDto.fieldMappings);
          
          // Validar datos requeridos
          const validation = this.validateVoterData(voterData, rowNumber);
          if (validation.length > 0) {
            errors.push(...validation);
            errorCount++;
            continue;
          }

          // Buscar líder si está especificado
          let leader: Leader | null = null;
          if (voterData.leaderCedula) {
            leader = await this.leaderRepository.findOne({
              where: { cedula: voterData.leaderCedula }
            });
            
            if (!leader) {
              errors.push({
                row: rowNumber,
                field: 'leaderCedula',
                value: voterData.leaderCedula,
                error: 'Líder no encontrado',
                severity: 'warning'
              });
            }
          }

          // Crear o actualizar votante - ✅ CORREGIDO
          let voter = await this.voterRepository.findOne({
            where: { cedula: voterData.cedula }
          });

          if (voter) {
            // Actualizar existente - ✅ TIPOS CORREGIDOS
            await queryRunner.manager.update(Voter, { id: voter.id }, {
              firstName: voterData.firstName,
              lastName: voterData.lastName,
              phone: voterData.phone || undefined,
              email: voterData.email || undefined,
              address: voterData.address || undefined,
              neighborhood: voterData.neighborhood || undefined,
              municipality: voterData.municipality || undefined,
              votingPlace: voterData.votingPlace || undefined,
              birthDate: voterData.birthDate ? new Date(voterData.birthDate) : undefined, // ✅ CORREGIDO
              gender: voterData.gender || undefined,
              commitment: voterData.commitment || 'potential',
              notes: voterData.notes || undefined,
              leaderId: leader?.id || undefined,
            });
          } else {
            // Crear nuevo - ✅ TIPOS COMPLETAMENTE CORREGIDOS
            const newVoterData: Partial<Voter> = {
              cedula: voterData.cedula,
              firstName: voterData.firstName,
              lastName: voterData.lastName,
              isVerified: false,
              isActive: true,
              commitment: (voterData.commitment as any) || 'potential'
            };

            // Añadir campos opcionales solo si tienen valor
            if (voterData.phone) newVoterData.phone = voterData.phone;
            if (voterData.email) newVoterData.email = voterData.email;
            if (voterData.address) newVoterData.address = voterData.address;
            if (voterData.neighborhood) newVoterData.neighborhood = voterData.neighborhood;
            if (voterData.municipality) newVoterData.municipality = voterData.municipality;
            if (voterData.votingPlace) newVoterData.votingPlace = voterData.votingPlace;
            if (voterData.gender) newVoterData.gender = voterData.gender;
            if (voterData.notes) newVoterData.notes = voterData.notes;
            if (leader?.id) newVoterData.leaderId = leader.id;
            
            // ✅ CORREGIDO: Manejo seguro de fecha
            if (voterData.birthDate) {
              try {
                newVoterData.birthDate = new Date(voterData.birthDate);
              } catch (dateError) {
                // Si la fecha no es válida, simplemente no la incluimos
                errors.push({
                  row: rowNumber,
                  field: 'birthDate',
                  value: voterData.birthDate,
                  error: 'Formato de fecha inválido',
                  severity: 'warning'
                });
              }
            }

            voter = queryRunner.manager.create(Voter, newVoterData);
            await queryRunner.manager.save(voter);
          }

          successCount++;

        } catch (error) {
          errorCount++;
          errors.push({
            row: rowNumber,
            field: 'general',
            value: JSON.stringify(row),
            error: error.message,
            severity: 'error'
          });
        }
      }

      await queryRunner.commitTransaction();

      const result: ImportResultDto = {
        success: errorCount === 0,
        totalRows: mappingDto.previewData.length,
        successCount,
        errorCount,
        errors,
        warnings: [],
        executionTime: Date.now() - startTime
      };

      return result;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Error en importación: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  private async parseCSV(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(buffer.toString());
      
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  private mapRowToVoter(row: any, mappings: Record<string, string>): BulkImportVoterDto {
    const voter: BulkImportVoterDto = {
      cedula: '',
      firstName: '',
      lastName: ''
    };

    for (const [csvColumn, entityField] of Object.entries(mappings)) {
      if (row[csvColumn] !== undefined && row[csvColumn] !== null) {
        const value = String(row[csvColumn]).trim();
        
        // ✅ CORREGIDO: Asignación segura por campo
        switch (entityField) {
          case 'cedula':
            voter.cedula = value;
            break;
          case 'firstName':
            voter.firstName = value;
            break;
          case 'lastName':
            voter.lastName = value;
            break;
          case 'phone':
            voter.phone = value;
            break;
          case 'email':
            voter.email = value;
            break;
          case 'address':
            voter.address = value;
            break;
          case 'neighborhood':
            voter.neighborhood = value;
            break;
          case 'municipality':
            voter.municipality = value;
            break;
          case 'votingPlace':
            voter.votingPlace = value;
            break;
          case 'birthDate':
            voter.birthDate = value;
            break;
          case 'gender':
            if (['M', 'F', 'Other'].includes(value)) {
              voter.gender = value as 'M' | 'F' | 'Other';
            }
            break;
          case 'leaderCedula':
            voter.leaderCedula = value;
            break;
          case 'commitment':
            if (['committed', 'potential', 'undecided', 'opposed'].includes(value)) {
              voter.commitment = value as 'committed' | 'potential' | 'undecided' | 'opposed';
            }
            break;
          case 'notes':
            voter.notes = value;
            break;
        }
      }
    }

    return voter;
  }

  private validateVoterData(data: BulkImportVoterDto, rowNumber: number): ImportErrorDto[] {
    const errors: ImportErrorDto[] = [];

    if (!data.cedula || data.cedula.trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'cedula',
        value: data.cedula,
        error: 'Cédula es requerida',
        severity: 'error'
      });
    }

    if (!data.firstName || data.firstName.trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'firstName',
        value: data.firstName,
        error: 'Primer nombre es requerido',
        severity: 'error'
      });
    }

    if (!data.lastName || data.lastName.trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'lastName',
        value: data.lastName,
        error: 'Apellido es requerido',
        severity: 'error'
      });
    }

    // Validar formato de cédula (solo números)
    if (data.cedula && !/^\d+$/.test(data.cedula)) {
      errors.push({
        row: rowNumber,
        field: 'cedula',
        value: data.cedula,
        error: 'Cédula debe contener solo números',
        severity: 'error'
      });
    }

    // Validar email si está presente
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({
        row: rowNumber,
        field: 'email',
        value: data.email,
        error: 'Formato de email inválido',
        severity: 'warning'
      });
    }

    return errors;
  }
}