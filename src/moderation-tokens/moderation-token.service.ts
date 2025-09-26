/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { ModerationTokenRepository, type ModerationToken } from './moderation-token.repository';

@Injectable()
export class ModerationTokenService {
  constructor(private readonly moderationTokenRepository: ModerationTokenRepository) {}

  issueToken(payload: { userId?: number | null; expiresAt?: Date }): Promise<ModerationToken> {
    return this.moderationTokenRepository.issueToken(payload);
  }

  listActive(): Promise<ModerationToken[]> {
    return this.moderationTokenRepository.listActive();
  }

  revoke(id: number): Promise<void> {
    return this.moderationTokenRepository.revoke(id);
  }
}
