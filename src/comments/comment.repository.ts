/* eslint-disable prettier/prettier */

import { Injectable, NotFoundException } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DbService } from 'src/db/db.service';

export type CommentStatus = 'visible' | 'hidden' | 'pending';

export type Comment = {
  id: number;
  report_id: number;
  user_id: number;
  parent_comment_id: number | null;
  content: string;
  status: CommentStatus;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

@Injectable()
export class CommentRepository {
  constructor(private readonly dbService: DbService) {}

  async createComment(payload: {
    reportId: number;
    userId: number;
    parentCommentId?: number | null;
    content: string;
  }): Promise<Comment> {
    const sql = `INSERT INTO comments (report_id, user_id, parent_comment_id, content, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'pending', NOW(), NOW())`;
    const [result] = await this.dbService
      .getPool()
      .execute<ResultSetHeader>(sql, [payload.reportId, payload.userId, payload.parentCommentId ?? null, payload.content]);
    return this.findById(result.insertId);
  }

  async findById(id: number): Promise<Comment> {
    const sql = `SELECT id, report_id, user_id, parent_comment_id, content, status, created_at, updated_at, deleted_at FROM comments WHERE id = ? LIMIT 1`;
    const [rows] = await this.dbService.getPool().execute<RowDataPacket[]>(sql, [id]);
    const comment = rows[0] as Comment | undefined;
    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }
    return comment;
  }

  async findByReport(reportId: number): Promise<Comment[]> {
    const sql = `SELECT id, report_id, user_id, parent_comment_id, content, status, created_at, updated_at, deleted_at FROM comments WHERE report_id = ? ORDER BY created_at ASC`;
    const [rows] = await this.dbService.getPool().execute<RowDataPacket[]>(sql, [reportId]);
    return rows as Comment[];
  }

  async updateComment(id: number, payload: { content?: string; status?: CommentStatus | null }): Promise<Comment> {
    const sql = `UPDATE comments SET content = COALESCE(?, content), status = COALESCE(?, status), updated_at = NOW() WHERE id = ?`;
    await this.dbService.getPool().execute(sql, [payload.content ?? null, payload.status ?? null, id]);
    return this.findById(id);
  }

  async softDelete(id: number): Promise<void> {
    const sql = `UPDATE comments SET deleted_at = NOW(), status = 'hidden', updated_at = NOW() WHERE id = ?`;
    const [result] = await this.dbService.getPool().execute<ResultSetHeader>(sql, [id]);
    if (result.affectedRows === 0) {
      throw new NotFoundException('Comentario no encontrado');
    }
  }
}
