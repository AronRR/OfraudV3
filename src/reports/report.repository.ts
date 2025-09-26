/* eslint-disable prettier/prettier */

import { Injectable, NotFoundException } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DbService } from 'src/db/db.service';

export type ReportStatus = 'pending' | 'approved' | 'rejected';

export type Report = {
  id: number;
  user_id: number;
  category_id: number | null;
  title: string;
  description: string;
  amount: number | null;
  currency: string | null;
  occurred_at: string | null;
  location: string | null;
  status: ReportStatus;
  flagged_count: number;
  approved_at: Date | null;
  approved_by: number | null;
  created_at: Date;
  updated_at: Date;
};

export type ReportFilters = {
  status?: ReportStatus;
  categoryId?: number;
  userId?: number;
  search?: string;
  limit?: number;
  offset?: number;
};

@Injectable()
export class ReportRepository {
  constructor(private readonly dbService: DbService) {}

  async createReport(payload: {
    userId: number;
    categoryId?: number | null;
    title: string;
    description: string;
    amount?: number | null;
    currency?: string | null;
    occurred_at?: string | null;
    location?: string | null;
  }): Promise<Report> {
    const sql = `INSERT INTO reports (user_id, category_id, title, description, amount, currency, occurred_at, location, status, flagged_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, NOW(), NOW())`;
    const [result] = await this.dbService
      .getPool()
      .execute<ResultSetHeader>(sql, [
        payload.userId,
        payload.categoryId ?? null,
        payload.title,
        payload.description,
        payload.amount ?? null,
        payload.currency ?? null,
        payload.occurred_at ?? null,
        payload.location ?? null,
      ]);
    return this.findById(result.insertId);
  }

  async findById(id: number): Promise<Report> {
    const sql = `SELECT id, user_id, category_id, title, description, amount, currency, occurred_at, location, status, flagged_count, approved_at, approved_by, created_at, updated_at FROM reports WHERE id = ? LIMIT 1`;
    const [rows] = await this.dbService.getPool().execute<RowDataPacket[]>(sql, [id]);
    const report = rows[0] as Report | undefined;
    if (!report) {
      throw new NotFoundException('Reporte no encontrado');
    }
    return report;
  }

  async findAll(filters: ReportFilters): Promise<Report[]> {
    const conditions: string[] = [];
    const params: Array<string | number> = [];
    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }
    if (filters.categoryId) {
      conditions.push('category_id = ?');
      params.push(filters.categoryId);
    }
    if (filters.userId) {
      conditions.push('user_id = ?');
      params.push(filters.userId);
    }
    if (filters.search) {
      conditions.push('(title LIKE ? OR description LIKE ? OR location LIKE ? )');
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;
    const sql = `SELECT id, user_id, category_id, title, description, amount, currency, occurred_at, location, status, flagged_count, approved_at, approved_by, created_at, updated_at FROM reports ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const [rows] = await this.dbService.getPool().execute<RowDataPacket[]>(sql, [...params, limit, offset]);
    return rows as Report[];
  }

  async updateReport(
    id: number,
    payload: {
      categoryId?: number | null;
      title?: string;
      description?: string;
      amount?: number | null;
      currency?: string | null;
      occurred_at?: string | null;
      location?: string | null;
    },
  ): Promise<Report> {
    const sql = `UPDATE reports SET category_id = COALESCE(?, category_id), title = COALESCE(?, title), description = COALESCE(?, description), amount = COALESCE(?, amount), currency = COALESCE(?, currency), occurred_at = COALESCE(?, occurred_at), location = COALESCE(?, location), updated_at = NOW() WHERE id = ?`;
    await this.dbService
      .getPool()
      .execute(sql, [
        payload.categoryId ?? null,
        payload.title ?? null,
        payload.description ?? null,
        payload.amount ?? null,
        payload.currency ?? null,
        payload.occurred_at ?? null,
        payload.location ?? null,
        id,
      ]);
    return this.findById(id);
  }

  async updateStatus(id: number, status: ReportStatus, moderatorId?: number | null): Promise<Report> {
    const sql = `UPDATE reports SET status = ?, approved_at = CASE WHEN ? = 'approved' THEN NOW() ELSE approved_at END, approved_by = CASE WHEN ? = 'approved' THEN ? ELSE approved_by END, updated_at = NOW() WHERE id = ?`;
    await this.dbService.getPool().execute(sql, [status, status, status, moderatorId ?? null, id]);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    const sql = `DELETE FROM reports WHERE id = ?`;
    const [result] = await this.dbService.getPool().execute<ResultSetHeader>(sql, [id]);
    if (result.affectedRows === 0) {
      throw new NotFoundException('Reporte no encontrado');
    }
  }

  async incrementFlaggedCount(id: number): Promise<void> {
    const sql = `UPDATE reports SET flagged_count = flagged_count + 1 WHERE id = ?`;
    await this.dbService.getPool().execute(sql, [id]);
  }

  async resetFlaggedCount(id: number): Promise<void> {
    const sql = `UPDATE reports SET flagged_count = 0 WHERE id = ?`;
    await this.dbService.getPool().execute(sql, [id]);
  }
}
