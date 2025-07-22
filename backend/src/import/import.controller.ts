// backend/src/import/import.controller.ts - ACTUALIZADO CON PLANILLADOS

import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImportService } from './import.service';
import { ImportPreviewDto, ImportMappingDto, ImportResultDto } from './dto/import.dto';

@Controller('import')
@UseGuards(JwtAuthGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('preview')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max
    },
    fileFilter: (req, file, cb) => {
      const allowedMimes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'application/csv'
      ];
      
      if (allowedMimes.includes(file.mimetype) || 
          file.originalname.endsWith('.xlsx') || 
          file.originalname.endsWith('.xls') || 
          file.originalname.endsWith('.csv')) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Solo se permiten archivos Excel (.xlsx, .xls) y CSV (.csv)'), false);
      }
    },
  }))
  async previewFile(@UploadedFile() file: Express.Multer.File): Promise<ImportPreviewDto> {
    if (!file) {
      throw new BadRequestException('No se ha enviado ningún archivo');
    }

    return this.importService.previewFile(file);
  }

  // ✅ NUEVO - Endpoint para importar planillados
  @Post('planillados')
  async importPlanillados(@Body() mappingDto: ImportMappingDto): Promise<ImportResultDto> {
    if (!mappingDto.previewData || mappingDto.previewData.length === 0) {
      throw new BadRequestException('No hay datos para importar');
    }

    if (mappingDto.entityType !== 'planillados') {
      throw new BadRequestException('Tipo de entidad debe ser "planillados"');
    }

    return this.importService.importPlanillados(mappingDto);
  }

  @Post('voters')
  async importVoters(@Body() mappingDto: ImportMappingDto): Promise<ImportResultDto> {
    if (!mappingDto.previewData || mappingDto.previewData.length === 0) {
      throw new BadRequestException('No hay datos para importar');
    }

    if (mappingDto.entityType !== 'voters') {
      throw new BadRequestException('Tipo de entidad debe ser "voters"');
    }

    return this.importService.importVoters(mappingDto);
  }

  @Post('leaders')
  async importLeaders(@Body() mappingDto: ImportMappingDto): Promise<ImportResultDto> {
    if (!mappingDto.previewData || mappingDto.previewData.length === 0) {
      throw new BadRequestException('No hay datos para importar');
    }

    if (mappingDto.entityType !== 'leaders') {
      throw new BadRequestException('Tipo de entidad debe ser "leaders"');
    }

    return this.importService.importLeaders(mappingDto);
  }

  @Post('candidates')
  async importCandidates(@Body() mappingDto: ImportMappingDto): Promise<ImportResultDto> {
    if (!mappingDto.previewData || mappingDto.previewData.length === 0) {
      throw new BadRequestException('No hay datos para importar');
    }

    if (mappingDto.entityType !== 'candidates') {
      throw new BadRequestException('Tipo de entidad debe ser "candidates"');
    }

    return this.importService.importCandidates(mappingDto);
  }

  @Post('groups')
  async importGroups(@Body() mappingDto: ImportMappingDto): Promise<ImportResultDto> {
    if (!mappingDto.previewData || mappingDto.previewData.length === 0) {
      throw new BadRequestException('No hay datos para importar');
    }

    if (mappingDto.entityType !== 'groups') {
      throw new BadRequestException('Tipo de entidad debe ser "groups"');
    }

    return this.importService.importGroups(mappingDto);
  }

  // ✅ NUEVO - Endpoint para obtener sugerencias de mapeo
  @Post('suggest-mappings')
  async suggestMappings(@Body() data: { headers: string[], entityType: string }) {
    const { headers, entityType } = data;
    
    if (!headers || !entityType) {
      throw new BadRequestException('Headers y entityType son requeridos');
    }

    const suggestions = this.importService.suggestFieldMappings(headers, entityType);
    
    return {
      suggestions,
      entityType,
      availableFields: this.getAvailableFields(entityType)
    };
  }

  // ✅ Método auxiliar para obtener campos disponibles por tipo de entidad
  private getAvailableFields(entityType: string): string[] {
    const fieldMappings = {
      planillados: [
        'cedula',
        'nombres', 
        'apellidos',
        'celular',
        'direccion',
        'barrioVive',
        'fechaExpedicion',
        'departamentoVotacion',
        'municipioVotacion',
        'direccionVotacion',
        'zonaPuesto',
        'mesa',
        'liderCedula',
        'grupoNombre',
        'fechaNacimiento',
        'genero',
        'notas'
      ],
      voters: [
        'cedula',
        'firstName',
        'lastName', 
        'phone',
        'email',
        'address',
        'neighborhood',
        'municipality',
        'votingPlace',
        'birthDate',
        'gender',
        'leaderCedula',
        'commitment',
        'notes'
      ],
      leaders: [
        'cedula',
        'firstName',
        'lastName',
        'phone',
        'email',
        'address',
        'neighborhood',
        'municipality',
        'birthDate',
        'gender',
        'meta',
        'groupName'
      ],
      candidates: [
        'name',
        'email',
        'phone',
        'meta',
        'description',
        'position',
        'party'
      ],
      groups: [
        'name',
        'description',
        'zone',
        'meta',
        'candidateName'
      ]
    };

    return fieldMappings[entityType] || [];
  }
}