/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { PasswordResetController } from './password-reset.controller';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetRepository } from './password-reset.repository';
import { UserModule } from 'src/users/user.module';

@Module({
  imports: [UserModule],
  controllers: [PasswordResetController],
  providers: [PasswordResetService, PasswordResetRepository],
  exports: [PasswordResetService],
})
export class PasswordResetModule {}
