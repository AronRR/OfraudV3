/* eslint-disable prettier/prettier */

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReportService } from './report.service';
import type { Report, ReportStatus } from './report.repository';

class CreateReportDto {
  @ApiProperty({ example: 1, description: 'ID del usuario que reporta' })
  userId: number;

  @ApiProperty({ example: 2, required: false })
  categoryId?: number | null;

  @ApiProperty({ example: 'Fraude con tarjeta', description: 'Título del reporte' })
  title: string;

  @ApiProperty({ example: 'Descripción detallada del fraude' })
  description: string;

  @ApiProperty({ example: 2500, required: false })
  amount?: number | null;

  @ApiProperty({ example: 'USD', required: false })
  currency?: string | null;

  @ApiProperty({ example: '2023-11-05', required: false })
  occurred_at?: string | null;

  @ApiProperty({ example: 'Ciudad de México', required: false })
  location?: string | null;
}

class UpdateReportDto {
  @ApiProperty({ example: 2, required: false })
  categoryId?: number | null;

  @ApiProperty({ example: 'Nuevo título', required: false })
  title?: string;

  @ApiProperty({ example: 'Nueva descripción', required: false })
  description?: string;

  @ApiProperty({ example: 3000, required: false })
  amount?: number | null;

  @ApiProperty({ example: 'MXN', required: false })
  currency?: string | null;

  @ApiProperty({ example: '2023-12-01', required: false })
  occurred_at?: string | null;

  @ApiProperty({ example: 'Guadalajara', required: false })
  location?: string | null;
}

class UpdateReportStatusDto {
  @ApiProperty({ example: 'approved', enum: ['pending', 'approved', 'rejected'] })
  status: ReportStatus;

  @ApiProperty({ example: 10, required: false, description: 'ID del moderador que aprueba/rechaza' })
  moderatorId?: number | null;
}

@ApiTags('Reportes')
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  create(@Body() dto: CreateReportDto): Promise<Report> {
    return this.reportService.create({
      userId: dto.userId,
      categoryId: dto.categoryId ?? null,
      title: dto.title,
      description: dto.description,
      amount: dto.amount ?? null,
      currency: dto.currency ?? null,
      occurred_at: dto.occurred_at ?? null,
      location: dto.location ?? null,
    });
  }

  @Get()
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  findAll(
    @Query('status') status?: ReportStatus,
    @Query('categoryId') categoryId?: string,
    @Query('userId') userId?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<Report[]> {
    return this.reportService.findAll({
      status,
      categoryId: categoryId ? Number(categoryId) : undefined,
      userId: userId ? Number(userId) : undefined,
      search: search ?? undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Report> {
    return this.reportService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReportDto): Promise<Report> {
    return this.reportService.update(id, {
      categoryId: dto.categoryId ?? null,
      title: dto.title,
      description: dto.description,
      amount: dto.amount ?? null,
      currency: dto.currency ?? null,
      occurred_at: dto.occurred_at ?? null,
      location: dto.location ?? null,
    });
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReportStatusDto): Promise<Report> {
    return this.reportService.updateStatus(id, dto.status, dto.moderatorId ?? null);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.reportService.remove(id);
  }
}
