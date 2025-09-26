/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';

import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { CategoryModule } from './categories/category.module';
import { ReportModule } from './reports/report.module';
import { CommentModule } from './comments/comment.module';
import { ReportEvidenceModule } from './report-evidences/report-evidence.module';
import { ReportFlagModule } from './report-flags/report-flag.module';
import { SettingModule } from './settings/setting.module';
import { ModerationTokenModule } from './moderation-tokens/moderation-token.module';
import { PasswordResetModule } from './password-reset/password-reset.module';

@Module({
  imports: [JwtModule.register({
      global: true,
      secret:"supersecret"
  }),
  DbModule, UserModule, AuthModule, CategoryModule, ReportModule, CommentModule, ReportEvidenceModule, ReportFlagModule, SettingModule, ModerationTokenModule, PasswordResetModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
