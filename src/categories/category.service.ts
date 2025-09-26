/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { CategoryRepository, type Category } from './category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  create(name: string, description?: string | null): Promise<Category> {
    return this.categoryRepository.createCategory(name, description);
  }

  findAll(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  findOne(id: number): Promise<Category> {
    return this.categoryRepository.findById(id);
  }

  update(id: number, payload: { name?: string; description?: string | null }): Promise<Category> {
    return this.categoryRepository.updateCategory(id, payload);
  }

  remove(id: number): Promise<void> {
    return this.categoryRepository.removeCategory(id);
  }
}
