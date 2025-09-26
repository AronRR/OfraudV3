/* eslint-disable prettier/prettier */

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { ReportEvidenceService } from './report-evidence.service';
import type { ReportEvidence } from './report-evidence.repository';

class AddEvidenceDto {
  @ApiProperty({ example: 1 })
  reportId: number;

  @ApiProperty({ example: 'https://example.com/evidencia.jpg' })
  evidenceUrl: string;

  @ApiProperty({ example: 'image/jpeg', required: false })
  evidenceType?: string | null;

  @ApiProperty({ example: '{"size": "1MB"}', required: false })
  metadata?: string | null;
}

@ApiTags('Evidencias de Reportes')
@Controller('report-evidences')
export class ReportEvidenceController {
  constructor(private readonly reportEvidenceService: ReportEvidenceService) {}

  @Post()
  addEvidence(@Body() dto: AddEvidenceDto): Promise<ReportEvidence> {
    return this.reportEvidenceService.addEvidence({
      reportId: dto.reportId,
      evidenceUrl: dto.evidenceUrl,
      evidenceType: dto.evidenceType ?? null,
      metadata: dto.metadata ?? null,
    });
  }

  @Get('report/:reportId')
  findByReport(@Param('reportId', ParseIntPipe) reportId: number): Promise<ReportEvidence[]> {
    return this.reportEvidenceService.findByReport(reportId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.reportEvidenceService.remove(id);
  }
}
