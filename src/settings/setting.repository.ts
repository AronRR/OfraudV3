/* eslint-disable prettier/prettier */

import { Injectable, NotFoundException } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DbService } from 'src/db/db.service';

export type Setting = {
  id: number;
  key: string;
  value: string;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class SettingRepository {
  constructor(private readonly dbService: DbService) {}

  async findAll(): Promise<Setting[]> {
    const sql = `SELECT id, key, value, created_at, updated_at FROM settings ORDER BY key ASC`;
    const [rows] = await this.dbService.getPool().query<RowDataPacket[]>(sql);
    return rows as Setting[];
  }

  async findByKey(key: string): Promise<Setting> {
    const sql = `SELECT id, key, value, created_at, updated_at FROM settings WHERE key = ? LIMIT 1`;
    const [rows] = await this.dbService.getPool().execute<RowDataPacket[]>(sql, [key]);
    const setting = rows[0] as Setting | undefined;
    if (!setting) {
      throw new NotFoundException('Configuración no encontrada');
    }
    return setting;
  }

  async upsertSetting(key: string, value: string): Promise<Setting> {
    const sql = `INSERT INTO settings (key, value, created_at, updated_at) VALUES (?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = NOW()`;
    await this.dbService.getPool().execute<ResultSetHeader>(sql, [key, value]);
    return this.findByKey(key);
  }
}
