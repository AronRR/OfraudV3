/* eslint-disable prettier/prettier */

import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DbService } from 'src/db/db.service';

export type ReportFlagStatus = 'pending' | 'reviewed' | 'dismissed';

export type ReportFlag = {
  id: number;
  report_id: number;
  user_id: number;
  reason: string;
  status: ReportFlagStatus;
  created_at: Date;
  resolved_at: Date | null;
  resolved_by: number | null;
};

@Injectable()
export class ReportFlagRepository {
  constructor(private readonly dbService: DbService) {}

  async createFlag(payload: { reportId: number; userId: number; reason: string }): Promise<ReportFlag> {
    const existingSql = `SELECT id FROM report_flags WHERE report_id = ? AND user_id = ? AND status = 'pending' LIMIT 1`;
    const [existing] = await this.dbService.getPool().execute<RowDataPacket[]>(existingSql, [payload.reportId, payload.userId]);
    if (existing.length > 0) {
      throw new ConflictException('Ya existe un reporte pendiente para este usuario');
    }

    const sql = `INSERT INTO report_flags (report_id, user_id, reason, status, created_at) VALUES (?, ?, ?, 'pending', NOW())`;
    const [result] = await this.dbService
      .getPool()
      .execute<ResultSetHeader>(sql, [payload.reportId, payload.userId, payload.reason]);
    return this.findById(result.insertId);
  }

  async findById(id: number): Promise<ReportFlag> {
    const sql = `SELECT id, report_id, user_id, reason, status, created_at, resolved_at, resolved_by FROM report_flags WHERE id = ? LIMIT 1`;
    const [rows] = await this.dbService.getPool().execute<RowDataPacket[]>(sql, [id]);
    const flag = rows[0] as ReportFlag | undefined;
    if (!flag) {
      throw new NotFoundException('Flag no encontrado');
    }
    return flag;
  }

  async findByReport(reportId: number): Promise<ReportFlag[]> {
    const sql = `SELECT id, report_id, user_id, reason, status, created_at, resolved_at, resolved_by FROM report_flags WHERE report_id = ? ORDER BY created_at DESC`;
    const [rows] = await this.dbService.getPool().execute<RowDataPacket[]>(sql, [reportId]);
    return rows as ReportFlag[];
  }

  async findPending(): Promise<ReportFlag[]> {
    const sql = `SELECT id, report_id, user_id, reason, status, created_at, resolved_at, resolved_by FROM report_flags WHERE status = 'pending' ORDER BY created_at ASC`;
    const [rows] = await this.dbService.getPool().query<RowDataPacket[]>(sql);
    return rows as ReportFlag[];
  }

  async updateStatus(id: number, status: ReportFlagStatus, resolvedBy?: number | null): Promise<ReportFlag> {
    const sql = `UPDATE report_flags SET status = ?, resolved_at = CASE WHEN ? <> 'pending' THEN NOW() ELSE resolved_at END, resolved_by = CASE WHEN ? <> 'pending' THEN ? ELSE resolved_by END WHERE id = ?`;
    await this.dbService.getPool().execute(sql, [status, status, status, resolvedBy ?? null, id]);
    return this.findById(id);
  }
}
