/* eslint-disable prettier/prettier */

import { Injectable, NotFoundException } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DbService } from 'src/db/db.service';

export type ReportEvidence = {
  id: number;
  report_id: number;
  evidence_url: string;
  evidence_type: string | null;
  metadata: string | null;
  created_at: Date;
};

@Injectable()
export class ReportEvidenceRepository {
  constructor(private readonly dbService: DbService) {}

  async addEvidence(payload: {
    reportId: number;
    evidenceUrl: string;
    evidenceType?: string | null;
    metadata?: string | null;
  }): Promise<ReportEvidence> {
    const sql = `INSERT INTO report_evidences (report_id, evidence_url, evidence_type, metadata, created_at) VALUES (?, ?, ?, ?, NOW())`;
    const [result] = await this.dbService
      .getPool()
      .execute<ResultSetHeader>(sql, [
        payload.reportId,
        payload.evidenceUrl,
        payload.evidenceType ?? null,
        payload.metadata ?? null,
      ]);
    return this.findById(result.insertId);
  }

  async findById(id: number): Promise<ReportEvidence> {
    const sql = `SELECT id, report_id, evidence_url, evidence_type, metadata, created_at FROM report_evidences WHERE id = ? LIMIT 1`;
    const [rows] = await this.dbService.getPool().execute<RowDataPacket[]>(sql, [id]);
    const evidence = rows[0] as ReportEvidence | undefined;
    if (!evidence) {
      throw new NotFoundException('Evidencia no encontrada');
    }
    return evidence;
  }

  async findByReport(reportId: number): Promise<ReportEvidence[]> {
    const sql = `SELECT id, report_id, evidence_url, evidence_type, metadata, created_at FROM report_evidences WHERE report_id = ? ORDER BY created_at ASC`;
    const [rows] = await this.dbService.getPool().execute<RowDataPacket[]>(sql, [reportId]);
    return rows as ReportEvidence[];
  }

  async remove(id: number): Promise<void> {
    const sql = `DELETE FROM report_evidences WHERE id = ?`;
    const [result] = await this.dbService.getPool().execute<ResultSetHeader>(sql, [id]);
    if (result.affectedRows === 0) {
      throw new NotFoundException('Evidencia no encontrada');
    }
  }
}
