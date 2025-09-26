/* eslint-disable prettier/prettier */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DbService } from 'src/db/db.service';

export type RefreshTokenRecord = {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
  revoked_at: Date | null;
};

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly dbService: DbService) {}

  async storeToken(userId: number, token: string, expiresAt: Date): Promise<void> {
    const sql = `INSERT INTO refresh_tokens (user_id, token, expires_at, created_at) VALUES (?, ?, ?, NOW())`;
    await this.dbService.getPool().execute<ResultSetHeader>(sql, [userId, token, expiresAt]);
  }

  async findValidToken(token: string): Promise<RefreshTokenRecord> {
    const sql = `SELECT id, user_id, token, expires_at, created_at, revoked_at FROM refresh_tokens WHERE token = ? LIMIT 1`;
    const [rows] = await this.dbService.getPool().execute<RowDataPacket[]>(sql, [token]);
    const record = rows[0] as RefreshTokenRecord | undefined;
    if (!record || record.revoked_at || new Date(record.expires_at) < new Date()) {
      throw new UnauthorizedException('Token de refresco inválido');
    }
    return record;
  }

  async revokeToken(token: string): Promise<void> {
    const sql = `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = ? AND revoked_at IS NULL`;
    await this.dbService.getPool().execute<ResultSetHeader>(sql, [token]);
  }

  async revokeAllForUser(userId: number): Promise<void> {
    const sql = `UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL`;
    await this.dbService.getPool().execute<ResultSetHeader>(sql, [userId]);
  }
}
