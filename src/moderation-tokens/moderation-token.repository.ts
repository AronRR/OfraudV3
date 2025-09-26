/* eslint-disable prettier/prettier */

import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DbService } from 'src/db/db.service';

export type ModerationToken = {
  id: number;
  user_id: number | null;
  token: string;
  expires_at: Date;
  created_at: Date;
};

@Injectable()
export class ModerationTokenRepository {
  constructor(private readonly dbService: DbService) {}

  async issueToken(payload: { userId?: number | null; expiresAt?: Date }): Promise<ModerationToken> {
    const token = randomUUID();
    const expiresAt = payload.expiresAt ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    const sql = `INSERT INTO moderation_tokens (user_id, token, expires_at, created_at) VALUES (?, ?, ?, NOW())`;
    const [result] = await this.dbService
      .getPool()
      .execute<ResultSetHeader>(sql, [payload.userId ?? null, token, expiresAt]);
    return this.findById(result.insertId);
  }

  async findById(id: number): Promise<ModerationToken> {
    const sql = `SELECT id, user_id, token, expires_at, created_at FROM moderation_tokens WHERE id = ? LIMIT 1`;
    const [rows] = await this.dbService.getPool().execute<RowDataPacket[]>(sql, [id]);
    const moderationToken = rows[0] as ModerationToken | undefined;
    if (!moderationToken) {
      throw new NotFoundException('Token de moderación no encontrado');
    }
    return moderationToken;
  }

  async listActive(): Promise<ModerationToken[]> {
    const sql = `SELECT id, user_id, token, expires_at, created_at FROM moderation_tokens WHERE expires_at > NOW() ORDER BY created_at DESC`;
    const [rows] = await this.dbService.getPool().query<RowDataPacket[]>(sql);
    return rows as ModerationToken[];
  }

  async revoke(id: number): Promise<void> {
    const sql = `DELETE FROM moderation_tokens WHERE id = ?`;
    const [result] = await this.dbService.getPool().execute<ResultSetHeader>(sql, [id]);
    if (result.affectedRows === 0) {
      throw new NotFoundException('Token de moderación no encontrado');
    }
  }
}
