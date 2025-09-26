/* eslint-disable prettier/prettier */

import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { ReportFlagService } from './report-flag.service';
import type { ReportFlag, ReportFlagStatus } from './report-flag.repository';

class CreateReportFlagDto {
  @ApiProperty({ example: 1 })
  reportId: number;

  @ApiProperty({ example: 5 })
  userId: number;

  @ApiProperty({ example: 'Contenido ofensivo' })
  reason: string;
}

class UpdateReportFlagStatusDto {
  @ApiProperty({ example: 'reviewed', enum: ['pending', 'reviewed', 'dismissed'] })
  status: ReportFlagStatus;

  @ApiProperty({ example: 10, required: false })
  resolvedBy?: number | null;
}

@ApiTags('Flags de Reportes')
@Controller('report-flags')
export class ReportFlagController {
  constructor(private readonly reportFlagService: ReportFlagService) {}

  @Post()
  create(@Body() dto: CreateReportFlagDto): Promise<ReportFlag> {
    return this.reportFlagService.create({ reportId: dto.reportId, userId: dto.userId, reason: dto.reason });
  }

  @Get('pending')
  findPending(): Promise<ReportFlag[]> {
    return this.reportFlagService.findPending();
  }

  @Get('report/:reportId')
  findByReport(@Param('reportId', ParseIntPipe) reportId: number): Promise<ReportFlag[]> {
    return this.reportFlagService.findByReport(reportId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReportFlagStatusDto): Promise<ReportFlag> {
    return this.reportFlagService.updateStatus(id, dto.status, dto.resolvedBy ?? null);
  }
}
