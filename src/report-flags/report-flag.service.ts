/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { ReportService } from 'src/reports/report.service';
import { ReportFlagRepository, type ReportFlag, type ReportFlagStatus } from './report-flag.repository';

@Injectable()
export class ReportFlagService {
  constructor(
    private readonly reportFlagRepository: ReportFlagRepository,
    private readonly reportService: ReportService,
  ) {}

  async create(payload: { reportId: number; userId: number; reason: string }): Promise<ReportFlag> {
    const flag = await this.reportFlagRepository.createFlag(payload);
    await this.reportService.incrementFlaggedCount(payload.reportId);
    return flag;
  }

  findByReport(reportId: number): Promise<ReportFlag[]> {
    return this.reportFlagRepository.findByReport(reportId);
  }

  findPending(): Promise<ReportFlag[]> {
    return this.reportFlagRepository.findPending();
  }

  async updateStatus(id: number, status: ReportFlagStatus, resolvedBy?: number | null): Promise<ReportFlag> {
    const flag = await this.reportFlagRepository.updateStatus(id, status, resolvedBy ?? null);
    if (status !== 'pending') {
      await this.reportService.resetFlaggedCount(flag.report_id);
    }
    return flag;
  }
}
