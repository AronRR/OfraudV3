/* eslint-disable prettier/prettier */

import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import type { Comment, CommentStatus } from './comment.repository';

class CreateCommentDto {
  @ApiProperty({ example: 1 })
  reportId: number;

  @ApiProperty({ example: 2 })
  userId: number;

  @ApiProperty({ example: null, required: false })
  parentCommentId?: number | null;

  @ApiProperty({ example: 'Gracias por compartir esta información' })
  content: string;
}

class UpdateCommentDto {
  @ApiProperty({ example: 'Comentario editado', required: false })
  content?: string;

  @ApiProperty({ example: 'visible', enum: ['visible', 'hidden', 'pending'], required: false })
  status?: CommentStatus;
}

@ApiTags('Comentarios')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(@Body() dto: CreateCommentDto): Promise<Comment> {
    return this.commentService.create({
      reportId: dto.reportId,
      userId: dto.userId,
      parentCommentId: dto.parentCommentId ?? null,
      content: dto.content,
    });
  }

  @Get('report/:reportId')
  findByReport(@Param('reportId', ParseIntPipe) reportId: number): Promise<Comment[]> {
    return this.commentService.findByReport(reportId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Comment> {
    return this.commentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCommentDto): Promise<Comment> {
    return this.commentService.update(id, { content: dto.content, status: dto.status ?? null });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.commentService.remove(id);
  }
}
