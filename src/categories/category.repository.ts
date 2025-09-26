/* eslint-disable prettier/prettier */

import { Injectable, NotFoundException } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { DbService } from 'src/db/db.service';

export type Category = {
  id: number;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class CategoryRepository {
  constructor(private readonly dbService: DbService) {}

  async createCategory(name: string, description?: string | null): Promise<Category> {
    const sql = `INSERT INTO categories (name, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`;
    const [result] = await this.dbService.getPool().execute<ResultSetHeader>(sql, [name, description ?? null]);
    return this.findById(result.insertId);
  }

  async findById(id: number): Promise<Category> {
    const sql = `SELECT id, name, description, created_at, updated_at FROM categories WHERE id = ? LIMIT 1`;
    const [rows] = await this.dbService.getPool().execute<RowDataPacket[]>(sql, [id]);
    const category = rows[0] as Category | undefined;
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return category;
  }

  async findAll(): Promise<Category[]> {
    const sql = `SELECT id, name, description, created_at, updated_at FROM categories ORDER BY name ASC`;
    const [rows] = await this.dbService.getPool().query<RowDataPacket[]>(sql);
    return rows as Category[];
  }

  async updateCategory(id: number, payload: { name?: string; description?: string | null }): Promise<Category> {
    const { name, description } = payload;
    const sql = `UPDATE categories SET name = COALESCE(?, name), description = COALESCE(?, description), updated_at = NOW() WHERE id = ?`;
    await this.dbService.getPool().execute(sql, [name ?? null, description ?? null, id]);
    return this.findById(id);
  }

  async removeCategory(id: number): Promise<void> {
    const sql = `DELETE FROM categories WHERE id = ?`;
    const [result] = await this.dbService.getPool().execute<ResultSetHeader>(sql, [id]);
    if (result.affectedRows === 0) {
      throw new NotFoundException('Categoría no encontrada');
    }
  }
}
