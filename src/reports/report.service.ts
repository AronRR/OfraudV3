/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { ReportRepository, type Report, type ReportFilters, type ReportStatus } from './report.repository';

@Injectable()
export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  create(payload: {
    userId: number;
    categoryId?: number | null;
    title: string;
    description: string;
    amount?: number | null;
    currency?: string | null;
    occurred_at?: string | null;
    location?: string | null;
  }): Promise<Report> {
    return this.reportRepository.createReport(payload);
  }

  findAll(filters: ReportFilters): Promise<Report[]> {
    return this.reportRepository.findAll(filters);
  }

  findOne(id: number): Promise<Report> {
    return this.reportRepository.findById(id);
  }

  update(
    id: number,
    payload: {
      categoryId?: number | null;
      title?: string;
      description?: string;
      amount?: number | null;
      currency?: string | null;
      occurred_at?: string | null;
      location?: string | null;
    },
  ): Promise<Report> {
    return this.reportRepository.updateReport(id, payload);
  }

  updateStatus(id: number, status: ReportStatus, moderatorId?: number | null): Promise<Report> {
    return this.reportRepository.updateStatus(id, status, moderatorId);
  }

  remove(id: number): Promise<void> {
    return this.reportRepository.remove(id);
  }

  incrementFlaggedCount(id: number): Promise<void> {
    return this.reportRepository.incrementFlaggedCount(id);
  }

  resetFlaggedCount(id: number): Promise<void> {
    return this.reportRepository.resetFlaggedCount(id);
  }
}
