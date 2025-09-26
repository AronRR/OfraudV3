/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { UserService } from 'src/users/user.service';
import { PasswordResetRepository, type PasswordResetToken } from './password-reset.repository';

@Injectable()
export class PasswordResetService {
  constructor(private readonly passwordResetRepository: PasswordResetRepository, private readonly userService: UserService) {}

  requestReset(userId: number): Promise<PasswordResetToken> {
    return this.passwordResetRepository.createToken(userId);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await this.passwordResetRepository.findValidToken(token);
    await this.userService.updatePassword(record.user_id, newPassword);
    await this.passwordResetRepository.markAsUsed(record.id);
  }

  verifyToken(token: string): Promise<PasswordResetToken> {
    return this.passwordResetRepository.findValidToken(token);
  }
}
