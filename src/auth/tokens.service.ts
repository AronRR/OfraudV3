/* eslint-disable prettier/prettier */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenRepository } from './refresh-token.repository';

export type UserProfile = {
  id: string;
  email: string;
  name: string;
};

export type AccessPayload = {
  sub: string;
  type: 'access';
  profile: UserProfile;
};

export type RefreshPayload = {
  sub: string;
  type: 'refresh';
};

const JWT_SECRET = 'supersecret';
const REFRESH_EXPIRATION_MS = 1000 * 60 * 60 * 24 * 7;
const ACCESS_EXPIRATION = '15m';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService, private readonly refreshTokenRepository: RefreshTokenRepository) {}

  async generateAccess(profile: UserProfile): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: profile.id,
        type: 'access',
        profile: profile,
      },
      {
        expiresIn: ACCESS_EXPIRATION,
        secret: JWT_SECRET,
      },
    );
  }

  async generateRefresh(userId: string): Promise<string> {
    const expiresAt = new Date(Date.now() + REFRESH_EXPIRATION_MS);
    const token = await this.jwtService.signAsync(
      {
        sub: userId,
        type: 'refresh',
      },
      {
        expiresIn: Math.floor(REFRESH_EXPIRATION_MS / 1000),
        secret: JWT_SECRET,
      },
    );
    await this.refreshTokenRepository.storeToken(Number(userId), token, expiresAt);
    return token;
  }

  async verifyAccess(token: string): Promise<AccessPayload> {
    const payload = await this.jwtService.verifyAsync<AccessPayload>(token, {
      secret: JWT_SECRET,
    });
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Tipo de token inválido');
    }
    return payload;
  }

  async verifyRefresh(token: string): Promise<RefreshPayload> {
    const record = await this.refreshTokenRepository.findValidToken(token);
    const payload = await this.jwtService.verifyAsync<RefreshPayload>(token, {
      secret: JWT_SECRET,
    });
    if (payload.type !== 'refresh' || payload.sub !== record.user_id.toString()) {
      throw new UnauthorizedException('Tipo de token inválido');
    }
    return payload;
  }

  async revokeRefresh(token: string): Promise<void> {
    await this.refreshTokenRepository.revokeToken(token);
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await this.refreshTokenRepository.revokeAllForUser(userId);
  }
}
