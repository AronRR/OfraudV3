/* eslint-disable prettier/prettier */

import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DbService } from 'src/db/db.service';

export type PasswordResetToken = {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
  used_at: Date | null;
};

@Injectable()
export class PasswordResetRepository {
  constructor(private readonly dbService: DbService) {}

  async createToken(userId: number, expiresAt?: Date): Promise<PasswordResetToken> {
    const token = randomUUID();
    const expiration = expiresAt ?? new Date(Date.now() + 1000 * 60 * 30);
    const sql = `INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at) VALUES (?, ?, ?, NOW())`;
    const [result] = await this.dbService.getPool().execute<ResultSetHeader>(sql, [userId, token, expiration]);
    return this.findById(result.insertId);
  }

  async findById(id: number): Promise<PasswordResetToken> {
    const sql = `SELECT id, user_id, token, expires_at, created_at, used_at FROM password_reset_tokens WHERE id = ? LIMIT 1`;
    const [rows] = await this.dbService.getPool().execute<RowDataPacket[]>(sql, [id]);
    const record = rows[0] as PasswordResetToken | undefined;
    if (!record) {
      throw new NotFoundException('Token de restablecimiento no encontrado');
    }
    return record;
  }

  async findValidToken(token: string): Promise<PasswordResetToken> {
    const sql = `SELECT id, user_id, token, expires_at, created_at, used_at FROM password_reset_tokens WHERE token = ? LIMIT 1`;
    const [rows] = await this.dbService.getPool().execute<RowDataPacket[]>(sql, [token]);
    const record = rows[0] as PasswordResetToken | undefined;
    if (!record || record.used_at || new Date(record.expires_at) < new Date()) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
    return record;
  }

  async markAsUsed(id: number): Promise<void> {
    const sql = `UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?`;
    await this.dbService.getPool().execute<ResultSetHeader>(sql, [id]);
  }
}
