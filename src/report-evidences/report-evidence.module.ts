/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { ReportEvidenceController } from './report-evidence.controller';
import { ReportEvidenceService } from './report-evidence.service';
import { ReportEvidenceRepository } from './report-evidence.repository';

@Module({
  controllers: [ReportEvidenceController],
  providers: [ReportEvidenceService, ReportEvidenceRepository],
  exports: [ReportEvidenceService],
})
export class ReportEvidenceModule {}
