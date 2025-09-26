/* eslint-disable prettier/prettier */

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import type { Category } from './category.repository';

class CreateCategoryDto {
  @ApiProperty({ example: 'Phishing', description: 'Nombre de la categoría' })
  name: string;

  @ApiProperty({ example: 'Reportes relacionados con correos o sitios falsos', required: false })
  description?: string | null;
}

class UpdateCategoryDto {
  @ApiProperty({ example: 'Phishing', required: false })
  name?: string;

  @ApiProperty({ example: 'Descripción actualizada', required: false })
  description?: string | null;
}

@ApiTags('Categorías')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.create(dto.name, dto.description ?? null);
  }

  @Get()
  findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Category> {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto): Promise<Category> {
    return this.categoryService.update(id, { name: dto.name, description: dto.description ?? null });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.categoryService.remove(id);
  }
}
