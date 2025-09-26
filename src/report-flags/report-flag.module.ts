/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { ReportFlagController } from './report-flag.controller';
import { ReportFlagService } from './report-flag.service';
import { ReportFlagRepository } from './report-flag.repository';
import { ReportModule } from 'src/reports/report.module';

@Module({
  imports: [ReportModule],
  controllers: [ReportFlagController],
  providers: [ReportFlagService, ReportFlagRepository],
  exports: [ReportFlagService],
})
export class ReportFlagModule {}
