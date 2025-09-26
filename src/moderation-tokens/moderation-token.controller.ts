/* eslint-disable prettier/prettier */

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { ModerationTokenService } from './moderation-token.service';
import type { ModerationToken } from './moderation-token.repository';

class IssueModerationTokenDto {
  @ApiProperty({ example: 2, required: false })
  userId?: number | null;

  @ApiProperty({ example: '2024-01-31T23:59:59.000Z', required: false })
  expiresAt?: string;
}

@ApiTags('Tokens de Moderación')
@Controller('moderation-tokens')
export class ModerationTokenController {
  constructor(private readonly moderationTokenService: ModerationTokenService) {}

  @Post()
  issueToken(@Body() dto: IssueModerationTokenDto): Promise<ModerationToken> {
    return this.moderationTokenService.issueToken({
      userId: dto.userId ?? null,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });
  }

  @Get()
  listActive(): Promise<ModerationToken[]> {
    return this.moderationTokenService.listActive();
  }

  @Delete(':id')
  revoke(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.moderationTokenService.revoke(id);
  }
}
