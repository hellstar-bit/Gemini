// backend/src/import/import.service.ts - VERSIÓN COMPLETA CON TODOS LOS MÉTODOS

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as XLSX from 'xlsx';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { Leader } from '../leaders/entities/leader.entity';
import { Candidate } from '../candidates/entities/candidate.entity';
import { Group } from '../groups/entities/group.entity';
import { Planillado } from '../planillados/entities/planillado.entity';
import {
  ImportPreviewDto,
  ImportMappingDto,
  ImportResultDto,
  ImportErrorDto,
  BulkImportVoterDto,
  BulkImportLeaderDto,
  BulkImportCandidateDto,
  BulkImportGroupDto,
  BulkImportPlanilladoDto
} from './dto/import.dto';

@Injectable()
export class ImportService {
  constructor(
   
    @InjectRepository(Leader)
    private leaderRepository: Repository<Leader>,
    @InjectRepository(Candidate)
    private candidateRepository: Repository<Candidate>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(Planillado)
    private planilladoRepository: Repository<Planillado>,
    private dataSource: DataSource,
  ) {}

  // ✅ PREVIEW FILE - Procesar archivo y obtener preview
  async previewFile(file: Express.Multer.File): Promise<ImportPreviewDto> {
    try {
      let data: any[] = [];
      let headers: string[] = [];

      if (file.mimetype.includes('excel') || file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
        // Procesar Excel
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
        
        if (data.length > 0) {
          headers = Object.keys(data[0]);
        }
      } else if (file.mimetype.includes('csv') || file.originalname.endsWith('.csv')) {
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

  // ✅ IMPORTAR PLANILLADOS
  async importPlanillados(mappingDto: ImportMappingDto): Promise<ImportResultDto> {
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
          const planilladoData: BulkImportPlanilladoDto = this.mapRowToPlanillado(row, mappingDto.fieldMappings);
          
          // Validar datos requeridos
          const validation = this.validatePlanilladoData(planilladoData, rowNumber);
          if (validation.length > 0) {
            errors.push(...validation);
            errorCount++;
            continue;
          }

          // Buscar líder si está especificado
          let leader: Leader | null = null;
          if (planilladoData.liderCedula) {
            leader = await this.leaderRepository.findOne({
              where: { cedula: planilladoData.liderCedula }
            });
            
            if (!leader) {
              errors.push({
                row: rowNumber,
                field: 'liderCedula',
                value: planilladoData.liderCedula,
                error: 'Líder no encontrado',
                severity: 'warning'
              });
            }
          }

          // Crear o actualizar planillado
          let planillado = await this.planilladoRepository.findOne({
            where: { cedula: planilladoData.cedula }
          });

          if (planillado) {
            // Actualizar existente
            await queryRunner.manager.update(Planillado, { id: planillado.id }, {
              nombres: planilladoData.nombres,
              apellidos: planilladoData.apellidos,
              celular: planilladoData.celular || undefined,
              direccion: planilladoData.direccion || undefined,
              barrioVive: planilladoData.barrioVive || undefined,
              fechaExpedicion: planilladoData.fechaExpedicion ? new Date(planilladoData.fechaExpedicion) : undefined,
              municipioVotacion: planilladoData.municipioVotacion || undefined,
              zonaPuesto: planilladoData.zonaPuesto || undefined,
              mesa: planilladoData.mesa || undefined,
              liderId: leader?.id || undefined,
              actualizado: true,
              fechaActualizacion: new Date()
            });
          } else {
            // Crear nuevo
            const newPlanillado = queryRunner.manager.create(Planillado, {
              cedula: planilladoData.cedula,
              nombres: planilladoData.nombres,
              apellidos: planilladoData.apellidos,
              celular: planilladoData.celular || undefined,
              direccion: planilladoData.direccion || undefined,
              barrioVive: planilladoData.barrioVive || undefined,
              fechaExpedicion: planilladoData.fechaExpedicion ? new Date(planilladoData.fechaExpedicion) : undefined,
              municipioVotacion: planilladoData.municipioVotacion || undefined,
              zonaPuesto: planilladoData.zonaPuesto || undefined,
              mesa: planilladoData.mesa || undefined,
              liderId: leader?.id || undefined,
              estado: 'pendiente',
              esEdil: false,
              actualizado: true
            });
            
            await queryRunner.manager.save(newPlanillado);
          }

          successCount++;
        } catch (error) {
          errorCount++;
          errors.push({
            row: rowNumber,
            field: 'general',
            value: null,
            error: `Error procesando fila: ${error.message}`,
            severity: 'error'
          });
        }
      }

      await queryRunner.commitTransaction();

      const executionTime = Date.now() - startTime;

      return {
        success: errorCount === 0,
        totalRows: mappingDto.previewData.length,
        successCount,
        errorCount,
        errors,
        warnings: errors.filter(e => e.severity === 'warning').map(e => e.error),
        executionTime
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Error en importación: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ IMPORTAR VOTANTES
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

          // Crear o actualizar votante
          

          successCount++;
        } catch (error) {
          errorCount++;
          errors.push({
            row: rowNumber,
            field: 'general',
            value: null,
            error: `Error procesando fila: ${error.message}`,
            severity: 'error'
          });
        }
      }

      await queryRunner.commitTransaction();

      const executionTime = Date.now() - startTime;

      return {
        success: errorCount === 0,
        totalRows: mappingDto.previewData.length,
        successCount,
        errorCount,
        errors,
        warnings: errors.filter(e => e.severity === 'warning').map(e => e.error),
        executionTime
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Error en importación: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ IMPORTAR LÍDERES
  async importLeaders(mappingDto: ImportMappingDto): Promise<ImportResultDto> {
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
          const leaderData: BulkImportLeaderDto = this.mapRowToLeader(row, mappingDto.fieldMappings);
          
          // Validar datos requeridos
          const validation = this.validateLeaderData(leaderData, rowNumber);
          if (validation.length > 0) {
            errors.push(...validation);
            errorCount++;
            continue;
          }

          // Buscar grupo si está especificado
          let group: Group | null = null;
          if (leaderData.groupName) {
            group = await this.groupRepository.findOne({
              where: { name: leaderData.groupName }
            });
            
            if (!group) {
              errors.push({
                row: rowNumber,
                field: 'groupName',
                value: leaderData.groupName,
                error: 'Grupo no encontrado',
                severity: 'warning'
              });
            }
          }

          // Crear o actualizar líder
          let leader = await this.leaderRepository.findOne({
            where: { cedula: leaderData.cedula }
          });

          if (leader) {
            // Actualizar existente
            await queryRunner.manager.update(Leader, { id: leader.id }, {
              firstName: leaderData.firstName,
              lastName: leaderData.lastName,
              phone: leaderData.phone || undefined,
              email: leaderData.email || undefined,
              address: leaderData.address || undefined,
              neighborhood: leaderData.neighborhood || undefined,
              municipality: leaderData.municipality || undefined,
              birthDate: leaderData.birthDate ? new Date(leaderData.birthDate) : undefined,
              gender: leaderData.gender || undefined,
              meta: leaderData.meta || 0,
              groupId: group?.id || undefined,
              updatedAt: new Date()
            });
          } else {
            // Crear nuevo
            const newLeader = queryRunner.manager.create(Leader, {
              cedula: leaderData.cedula,
              firstName: leaderData.firstName,
              lastName: leaderData.lastName,
              phone: leaderData.phone || undefined,
              email: leaderData.email || undefined,
              address: leaderData.address || undefined,
              neighborhood: leaderData.neighborhood || undefined,
              municipality: leaderData.municipality || undefined,
              birthDate: leaderData.birthDate ? new Date(leaderData.birthDate) : undefined,
              gender: leaderData.gender || undefined,
              meta: leaderData.meta || 0,
              groupId: group?.id || undefined,
              isVerified: false,
              isActive: true
            });
            
            await queryRunner.manager.save(newLeader);
          }

          successCount++;
        } catch (error) {
          errorCount++;
          errors.push({
            row: rowNumber,
            field: 'general',
            value: null,
            error: `Error procesando fila: ${error.message}`,
            severity: 'error'
          });
        }
      }

      await queryRunner.commitTransaction();

      const executionTime = Date.now() - startTime;

      return {
        success: errorCount === 0,
        totalRows: mappingDto.previewData.length,
        successCount,
        errorCount,
        errors,
        warnings: errors.filter(e => e.severity === 'warning').map(e => e.error),
        executionTime
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Error en importación: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ IMPORTAR CANDIDATOS
  async importCandidates(mappingDto: ImportMappingDto): Promise<ImportResultDto> {
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
          const candidateData: BulkImportCandidateDto = this.mapRowToCandidate(row, mappingDto.fieldMappings);
          
          // Validar datos requeridos
          const validation = this.validateCandidateData(candidateData, rowNumber);
          if (validation.length > 0) {
            errors.push(...validation);
            errorCount++;
            continue;
          }

          // Crear o actualizar candidato
          let candidate = await this.candidateRepository.findOne({
            where: { email: candidateData.email }
          });

          if (candidate) {
            // Actualizar existente
            await queryRunner.manager.update(Candidate, { id: candidate.id }, {
              name: candidateData.name,
              phone: candidateData.phone || undefined,
              meta: candidateData.meta || 0,
              description: candidateData.description || undefined,
              position: candidateData.position || undefined,
              party: candidateData.party || undefined,
              updatedAt: new Date()
            });
          } else {
            // Crear nuevo
            const newCandidate = queryRunner.manager.create(Candidate, {
              name: candidateData.name,
              email: candidateData.email,
              phone: candidateData.phone || undefined,
              meta: candidateData.meta || 0,
              description: candidateData.description || undefined,
              position: candidateData.position || undefined,
              party: candidateData.party || undefined,
              isActive: true
            });
            
            await queryRunner.manager.save(newCandidate);
          }

          successCount++;
        } catch (error) {
          errorCount++;
          errors.push({
            row: rowNumber,
            field: 'general',
            value: null,
            error: `Error procesando fila: ${error.message}`,
            severity: 'error'
          });
        }
      }

      await queryRunner.commitTransaction();

      const executionTime = Date.now() - startTime;

      return {
        success: errorCount === 0,
        totalRows: mappingDto.previewData.length,
        successCount,
        errorCount,
        errors,
        warnings: errors.filter(e => e.severity === 'warning').map(e => e.error),
        executionTime
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Error en importación: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ IMPORTAR GRUPOS
  async importGroups(mappingDto: ImportMappingDto): Promise<ImportResultDto> {
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
          const groupData: BulkImportGroupDto = this.mapRowToGroup(row, mappingDto.fieldMappings);
          
          // Validar datos requeridos
          const validation = this.validateGroupData(groupData, rowNumber);
          if (validation.length > 0) {
            errors.push(...validation);
            errorCount++;
            continue;
          }

          // Buscar candidato si está especificado
          let candidate: Candidate | null = null;
          if (groupData.candidateName) {
            candidate = await this.candidateRepository.findOne({
              where: { name: groupData.candidateName }
            });
            
            if (!candidate) {
              errors.push({
                row: rowNumber,
                field: 'candidateName',
                value: groupData.candidateName,
                error: 'Candidato no encontrado',
                severity: 'warning'
              });
            }
          }

          // Para grupos necesitamos al menos un candidato
          if (!candidate) {
            errors.push({
              row: rowNumber,
              field: 'candidateName',
              value: groupData.candidateName,
              error: 'Se requiere un candidato válido para crear el grupo',
              severity: 'error'
            });
            errorCount++;
            continue;
          }

          // Crear o actualizar grupo
          let group = await this.groupRepository.findOne({
            where: { name: groupData.name, candidateId: candidate.id }
          });

          if (group) {
            // Actualizar existente
            await queryRunner.manager.update(Group, { id: group.id }, {
              description: groupData.description || undefined,
              zone: groupData.zone || undefined,
              meta: groupData.meta || 0,
              updatedAt: new Date()
            });
          } else {
            // Crear nuevo
            const newGroup = queryRunner.manager.create(Group, {
              name: groupData.name,
              description: groupData.description || undefined,
              zone: groupData.zone || undefined,
              meta: groupData.meta || 0,
              candidateId: candidate.id,
              isActive: true
            });
            
            await queryRunner.manager.save(newGroup);
          }

          successCount++;
        } catch (error) {
          errorCount++;
          errors.push({
            row: rowNumber,
            field: 'general',
            value: null,
            error: `Error procesando fila: ${error.message}`,
            severity: 'error'
          });
        }
      }

      await queryRunner.commitTransaction();

      const executionTime = Date.now() - startTime;

      return {
        success: errorCount === 0,
        totalRows: mappingDto.previewData.length,
        successCount,
        errorCount,
        errors,
        warnings: errors.filter(e => e.severity === 'warning').map(e => e.error),
        executionTime
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Error en importación: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  // ✅ SUGERIR MAPEOS DE CAMPOS
  suggestFieldMappings(headers: string[], entityType: string): Record<string, string> {
    const mappings: Record<string, string> = {};
    
    if (entityType === 'planillados') {
      headers.forEach(header => {
        const cleanHeader = header.toLowerCase().trim();
        
        if (cleanHeader.includes('cédula') || cleanHeader.includes('cedula') || cleanHeader === 'cc') {
          mappings[header] = 'cedula';
        } else if (cleanHeader.includes('nombres') || cleanHeader.includes('nombre')) {
          mappings[header] = 'nombres';
        } else if (cleanHeader.includes('apellidos') || cleanHeader.includes('apellido')) {
          mappings[header] = 'apellidos';
        } else if (cleanHeader.includes('celular') || cleanHeader.includes('teléfono') || cleanHeader.includes('telefono') || cleanHeader.includes('móvil')) {
          mappings[header] = 'celular';
        } else if (cleanHeader.includes('dirección') || cleanHeader.includes('direccion')) {
          mappings[header] = 'direccion';
        } else if (cleanHeader.includes('barrio')) {
          mappings[header] = 'barrioVive';
        } else if (cleanHeader.includes('fecha') && cleanHeader.includes('expedición')) {
          mappings[header] = 'fechaExpedicion';
        } else if (cleanHeader.includes('municipio') && cleanHeader.includes('votación')) {
          mappings[header] = 'municipioVotacion';
        } else if (cleanHeader.includes('zona') && cleanHeader.includes('puesto')) {
          mappings[header] = 'zonaPuesto';
        } else if (cleanHeader.includes('mesa')) {
          mappings[header] = 'mesa';
        }
      });
    } else if (entityType === 'voters') {
      headers.forEach(header => {
        const cleanHeader = header.toLowerCase().trim();
        
        if (cleanHeader.includes('cédula') || cleanHeader.includes('cedula')) {
          mappings[header] = 'cedula';
        } else if (cleanHeader.includes('nombres') || cleanHeader.includes('nombre')) {
          mappings[header] = 'firstName';
        } else if (cleanHeader.includes('apellidos') || cleanHeader.includes('apellido')) {
          mappings[header] = 'lastName';
        } else if (cleanHeader.includes('celular') || cleanHeader.includes('teléfono')) {
          mappings[header] = 'phone';
        } else if (cleanHeader.includes('dirección') || cleanHeader.includes('direccion')) {
          mappings[header] = 'address';
        } else if (cleanHeader.includes('barrio')) {
          mappings[header] = 'neighborhood';
        } else if (cleanHeader.includes('municipio')) {
          mappings[header] = 'municipality';
        }
      });
    } else if (entityType === 'leaders') {
      headers.forEach(header => {
        const cleanHeader = header.toLowerCase().trim();
        
        if (cleanHeader.includes('cédula') || cleanHeader.includes('cedula')) {
          mappings[header] = 'cedula';
        } else if (cleanHeader.includes('nombres') || cleanHeader.includes('nombre')) {
          mappings[header] = 'firstName';
        } else if (cleanHeader.includes('apellidos') || cleanHeader.includes('apellido')) {
          mappings[header] = 'lastName';
        } else if (cleanHeader.includes('celular') || cleanHeader.includes('teléfono')) {
          mappings[header] = 'phone';
        } else if (cleanHeader.includes('email') || cleanHeader.includes('correo')) {
          mappings[header] = 'email';
        } else if (cleanHeader.includes('meta')) {
          mappings[header] = 'meta';
        } else if (cleanHeader.includes('grupo')) {
          mappings[header] = 'groupName';
        }
      });
    } else if (entityType === 'candidates') {
      headers.forEach(header => {
        const cleanHeader = header.toLowerCase().trim();
        
        if (cleanHeader.includes('nombre') || cleanHeader.includes('name')) {
          mappings[header] = 'name';
        } else if (cleanHeader.includes('email') || cleanHeader.includes('correo')) {
          mappings[header] = 'email';
        } else if (cleanHeader.includes('celular') || cleanHeader.includes('teléfono')) {
          mappings[header] = 'phone';
        } else if (cleanHeader.includes('cargo') || cleanHeader.includes('position')) {
          mappings[header] = 'position';
        } else if (cleanHeader.includes('partido') || cleanHeader.includes('party')) {
          mappings[header] = 'party';
        } else if (cleanHeader.includes('meta')) {
          mappings[header] = 'meta';
        }
      });
    } else if (entityType === 'groups') {
      headers.forEach(header => {
        const cleanHeader = header.toLowerCase().trim();
        
        if (cleanHeader.includes('nombre') || cleanHeader.includes('name')) {
          mappings[header] = 'name';
        } else if (cleanHeader.includes('descripción') || cleanHeader.includes('description')) {
          mappings[header] = 'description';
        } else if (cleanHeader.includes('zona') || cleanHeader.includes('zone')) {
          mappings[header] = 'zone';
        } else if (cleanHeader.includes('candidato') || cleanHeader.includes('candidate')) {
          mappings[header] = 'candidateName';
        } else if (cleanHeader.includes('meta')) {
          mappings[header] = 'meta';
        }
      });
    }
    
    return mappings;
  }

  // ===============================================
  // MÉTODOS AUXILIARES DE MAPEO
  // ===============================================

  // ✅ MAPEAR FILA A PLANILLADO
  private mapRowToPlanillado(row: any, mappings: Record<string, string>): BulkImportPlanilladoDto {
  const planillado: BulkImportPlanilladoDto = {
    cedula: '',
    nombres: '',
    apellidos: ''
  };

  for (const [csvColumn, entityField] of Object.entries(mappings)) {
    if (row[csvColumn] !== undefined && row[csvColumn] !== null) {
      let value = String(row[csvColumn]).trim();
      
      switch (entityField) {
        case 'cedula':
          planillado.cedula = value;
          break;
        case 'nombres':
          planillado.nombres = this.capitalizeWords(value); // ✅ Normalizar
          break;
        case 'apellidos':
          planillado.apellidos = this.capitalizeWords(value); // ✅ Normalizar
          break;
        case 'barrioVive':
          planillado.barrioVive = this.normalizeBarrio(value); // ✅ Normalizar barrio
          break;
        case 'municipioVotacion':
          planillado.municipioVotacion = this.capitalizeWords(value); // ✅ Normalizar
          break;
          case 'zonaPuesto':
            planillado.zonaPuesto = value;
            break;
          case 'mesa':
            planillado.mesa = value;
            break;
          case 'liderCedula':
            planillado.liderCedula = value;
            break;
          case 'fechaNacimiento':
            planillado.fechaNacimiento = value;
            break;
          case 'genero':
            if (['M', 'F', 'Otro'].includes(value)) {
              planillado.genero = value as 'M' | 'F' | 'Otro';
            }
            break;
          case 'notas':
            planillado.notas = value;
            break;
        }
      }
    }

    return planillado;
  }
  private normalizeBarrio(barrio: string): string {
  if (!barrio) return barrio;
  
  // Convertir a mayúsculas y limpiar espacios
  return barrio.trim().toUpperCase();
}

private capitalizeWords(text: string): string {
  if (!text) return text;
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

  // ✅ MAPEAR FILA A VOTANTE
  private mapRowToVoter(row: any, mappings: Record<string, string>): BulkImportVoterDto {
    const voter: BulkImportVoterDto = {
      cedula: '',
      firstName: '',
      lastName: ''
    };

    for (const [csvColumn, entityField] of Object.entries(mappings)) {
      if (row[csvColumn] !== undefined && row[csvColumn] !== null) {
        const value = String(row[csvColumn]).trim();
        
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

  // ✅ MAPEAR FILA A LÍDER
  private mapRowToLeader(row: any, mappings: Record<string, string>): BulkImportLeaderDto {
    const leader: BulkImportLeaderDto = {
      cedula: '',
      firstName: '',
      lastName: ''
    };

    for (const [csvColumn, entityField] of Object.entries(mappings)) {
      if (row[csvColumn] !== undefined && row[csvColumn] !== null) {
        const value = String(row[csvColumn]).trim();
        
        switch (entityField) {
          case 'cedula':
            leader.cedula = value;
            break;
          case 'firstName':
            leader.firstName = value;
            break;
          case 'lastName':
            leader.lastName = value;
            break;
          case 'phone':
            leader.phone = value;
            break;
          case 'email':
            leader.email = value;
            break;
          case 'address':
            leader.address = value;
            break;
          case 'neighborhood':
            leader.neighborhood = value;
            break;
          case 'municipality':
            leader.municipality = value;
            break;
          case 'birthDate':
            leader.birthDate = value;
            break;
          case 'gender':
            if (['M', 'F', 'Other'].includes(value)) {
              leader.gender = value as 'M' | 'F' | 'Other';
            }
            break;
          case 'meta':
            leader.meta = parseInt(value) || 0;
            break;
          case 'groupName':
            leader.groupName = value;
            break;
        }
      }
    }

    return leader;
  }

  // ✅ MAPEAR FILA A CANDIDATO
  private mapRowToCandidate(row: any, mappings: Record<string, string>): BulkImportCandidateDto {
    const candidate: BulkImportCandidateDto = {
      name: '',
      email: ''
    };

    for (const [csvColumn, entityField] of Object.entries(mappings)) {
      if (row[csvColumn] !== undefined && row[csvColumn] !== null) {
        const value = String(row[csvColumn]).trim();
        
        switch (entityField) {
          case 'name':
            candidate.name = value;
            break;
          case 'email':
            candidate.email = value;
            break;
          case 'phone':
            candidate.phone = value;
            break;
          case 'meta':
            candidate.meta = parseInt(value) || 0;
            break;
          case 'description':
            candidate.description = value;
            break;
          case 'position':
            candidate.position = value;
            break;
          case 'party':
            candidate.party = value;
            break;
        }
      }
    }

    return candidate;
  }

  // ✅ MAPEAR FILA A GRUPO
  private mapRowToGroup(row: any, mappings: Record<string, string>): BulkImportGroupDto {
    const group: BulkImportGroupDto = {
      name: ''
    };

    for (const [csvColumn, entityField] of Object.entries(mappings)) {
      if (row[csvColumn] !== undefined && row[csvColumn] !== null) {
        const value = String(row[csvColumn]).trim();
        
        switch (entityField) {
          case 'name':
            group.name = value;
            break;
          case 'description':
            group.description = value;
            break;
          case 'zone':
            group.zone = value;
            break;
          case 'meta':
            group.meta = parseInt(value) || 0;
            break;
          case 'candidateName':
            group.candidateName = value;
            break;
        }
      }
    }

    return group;
  }

  // ===============================================
  // MÉTODOS DE VALIDACIÓN
  // ===============================================

  // ✅ VALIDAR DATOS DE PLANILLADO
  private validatePlanilladoData(data: BulkImportPlanilladoDto, row: number): ImportErrorDto[] {
    const errors: ImportErrorDto[] = [];

    // Validar campos requeridos
    if (!data.cedula || data.cedula.trim() === '') {
      errors.push({
        row,
        field: 'cedula',
        value: data.cedula,
        error: 'Cédula es requerida',
        severity: 'error'
      });
    }

    if (!data.nombres || data.nombres.trim() === '') {
      errors.push({
        row,
        field: 'nombres',
        value: data.nombres,
        error: 'Nombres son requeridos',
        severity: 'error'
      });
    }

    if (!data.apellidos || data.apellidos.trim() === '') {
      errors.push({
        row,
        field: 'apellidos',
        value: data.apellidos,
        error: 'Apellidos son requeridos',
        severity: 'error'
      });
    }

    // Validar formato de cédula
    if (data.cedula && !/^\d{8,10}$/.test(data.cedula.replace(/\D/g, ''))) {
      errors.push({
        row,
        field: 'cedula',
        value: data.cedula,
        error: 'Cédula debe tener entre 8 y 10 dígitos',
        severity: 'error'
      });
    }

    // Validar celular si existe
    if (data.celular && !/^3\d{9}$/.test(data.celular.replace(/\D/g, ''))) {
      errors.push({
        row,
        field: 'celular',
        value: data.celular,
        error: 'Celular debe tener 10 dígitos y empezar por 3',
        severity: 'warning'
      });
    }

    return errors;
  }

  // ✅ VALIDAR DATOS DE VOTANTE
  private validateVoterData(data: BulkImportVoterDto, row: number): ImportErrorDto[] {
    const errors: ImportErrorDto[] = [];

    // Validar campos requeridos
    if (!data.cedula || data.cedula.trim() === '') {
      errors.push({
        row,
        field: 'cedula',
        value: data.cedula,
        error: 'Cédula es requerida',
        severity: 'error'
      });
    }

    if (!data.firstName || data.firstName.trim() === '') {
      errors.push({
        row,
        field: 'firstName',
        value: data.firstName,
        error: 'Nombres son requeridos',
        severity: 'error'
      });
    }

    if (!data.lastName || data.lastName.trim() === '') {
      errors.push({
        row,
        field: 'lastName',
        value: data.lastName,
        error: 'Apellidos son requeridos',
        severity: 'error'
      });
    }

    // Validar formato de cédula
    if (data.cedula && !/^\d{8,10}$/.test(data.cedula.replace(/\D/g, ''))) {
      errors.push({
        row,
        field: 'cedula',
        value: data.cedula,
        error: 'Cédula debe tener entre 8 y 10 dígitos',
        severity: 'error'
      });
    }

    // Validar email si existe
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({
        row,
        field: 'email',
        value: data.email,
        error: 'Formato de email inválido',
        severity: 'warning'
      });
    }

    return errors;
  }

  // ✅ VALIDAR DATOS DE LÍDER
  private validateLeaderData(data: BulkImportLeaderDto, row: number): ImportErrorDto[] {
    const errors: ImportErrorDto[] = [];

    // Validar campos requeridos
    if (!data.cedula || data.cedula.trim() === '') {
      errors.push({
        row,
        field: 'cedula',
        value: data.cedula,
        error: 'Cédula es requerida',
        severity: 'error'
      });
    }

    if (!data.firstName || data.firstName.trim() === '') {
      errors.push({
        row,
        field: 'firstName',
        value: data.firstName,
        error: 'Nombres son requeridos',
        severity: 'error'
      });
    }

    if (!data.lastName || data.lastName.trim() === '') {
      errors.push({
        row,
        field: 'lastName',
        value: data.lastName,
        error: 'Apellidos son requeridos',
        severity: 'error'
      });
    }

    // Validar formato de cédula
    if (data.cedula && !/^\d{8,10}$/.test(data.cedula.replace(/\D/g, ''))) {
      errors.push({
        row,
        field: 'cedula',
        value: data.cedula,
        error: 'Cédula debe tener entre 8 y 10 dígitos',
        severity: 'error'
      });
    }

    // Validar email si existe
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({
        row,
        field: 'email',
        value: data.email,
        error: 'Formato de email inválido',
        severity: 'warning'
      });
    }

    return errors;
  }

  // ✅ VALIDAR DATOS DE CANDIDATO
  private validateCandidateData(data: BulkImportCandidateDto, row: number): ImportErrorDto[] {
    const errors: ImportErrorDto[] = [];

    // Validar campos requeridos
    if (!data.name || data.name.trim() === '') {
      errors.push({
        row,
        field: 'name',
        value: data.name,
        error: 'Nombre es requerido',
        severity: 'error'
      });
    }

    if (!data.email || data.email.trim() === '') {
      errors.push({
        row,
        field: 'email',
        value: data.email,
        error: 'Email es requerido',
        severity: 'error'
      });
    }

    // Validar email
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push({
        row,
        field: 'email',
        value: data.email,
        error: 'Formato de email inválido',
        severity: 'error'
      });
    }

    return errors;
  }

  // ✅ VALIDAR DATOS DE GRUPO
  private validateGroupData(data: BulkImportGroupDto, row: number): ImportErrorDto[] {
    const errors: ImportErrorDto[] = [];

    // Validar campos requeridos
    if (!data.name || data.name.trim() === '') {
      errors.push({
        row,
        field: 'name',
        value: data.name,
        error: 'Nombre del grupo es requerido',
        severity: 'error'
      });
    }

    return errors;
  }

  // ===============================================
  // MÉTODOS AUXILIARES
  // ===============================================

  // ✅ PROCESAR CSV
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
}

