// backend/src/import/import.controller.ts
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

    // TODO: Implementar importación de líderes
    throw new BadRequestException('Importación de líderes no implementada aún');
  }

  @Post('candidates')
  async importCandidates(@Body() mappingDto: ImportMappingDto): Promise<ImportResultDto> {
    if (!mappingDto.previewData || mappingDto.previewData.length === 0) {
      throw new BadRequestException('No hay datos para importar');
    }

    if (mappingDto.entityType !== 'candidates') {
      throw new BadRequestException('Tipo de entidad debe ser "candidates"');
    }

    // TODO: Implementar importación de candidatos
    throw new BadRequestException('Importación de candidatos no implementada aún');
  }

  @Post('groups')
  async importGroups(@Body() mappingDto: ImportMappingDto): Promise<ImportResultDto> {
    if (!mappingDto.previewData || mappingDto.previewData.length === 0) {
      throw new BadRequestException('No hay datos para importar');
    }

    if (mappingDto.entityType !== 'groups') {
      throw new BadRequestException('Tipo de entidad debe ser "groups"');
    }

    // TODO: Implementar importación de grupos
    throw new BadRequestException('Importación de grupos no implementada aún');
  }
}