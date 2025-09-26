/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { ModerationTokenController } from './moderation-token.controller';
import { ModerationTokenService } from './moderation-token.service';
import { ModerationTokenRepository } from './moderation-token.repository';

@Module({
  controllers: [ModerationTokenController],
  providers: [ModerationTokenService, ModerationTokenRepository],
  exports: [ModerationTokenService],
})
export class ModerationTokenModule {}
