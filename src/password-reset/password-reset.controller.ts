/* eslint-disable prettier/prettier */

import { Body, Controller, Post } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { PasswordResetService } from './password-reset.service';
import type { PasswordResetToken } from './password-reset.repository';

class RequestResetDto {
  @ApiProperty({ example: 1 })
  userId: number;
}

class ResetPasswordDto {
  @ApiProperty({ example: 'token-uuid' })
  token: string;

  @ApiProperty({ example: 'nuevaPassword123' })
  newPassword: string;
}

class VerifyTokenDto {
  @ApiProperty({ example: 'token-uuid' })
  token: string;
}

@ApiTags('Recuperación de Contraseña')
@Controller('password-reset')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('request')
  request(@Body() dto: RequestResetDto): Promise<PasswordResetToken> {
    return this.passwordResetService.requestReset(dto.userId);
  }

  @Post('verify')
  verify(@Body() dto: VerifyTokenDto): Promise<PasswordResetToken> {
    return this.passwordResetService.verifyToken(dto.token);
  }

  @Post('confirm')
  async confirm(@Body() dto: ResetPasswordDto): Promise<{ success: boolean }> {
    await this.passwordResetService.resetPassword(dto.token, dto.newPassword);
    return { success: true };
  }
}
