/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { ReportEvidenceRepository, type ReportEvidence } from './report-evidence.repository';

@Injectable()
export class ReportEvidenceService {
  constructor(private readonly reportEvidenceRepository: ReportEvidenceRepository) {}

  addEvidence(payload: {
    reportId: number;
    evidenceUrl: string;
    evidenceType?: string | null;
    metadata?: string | null;
  }): Promise<ReportEvidence> {
    return this.reportEvidenceRepository.addEvidence(payload);
  }

  findByReport(reportId: number): Promise<ReportEvidence[]> {
    return this.reportEvidenceRepository.findByReport(reportId);
  }

  remove(id: number): Promise<void> {
    return this.reportEvidenceRepository.remove(id);
  }
}
