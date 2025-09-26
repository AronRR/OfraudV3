/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { CommentRepository, type Comment, type CommentStatus } from './comment.repository';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  create(payload: { reportId: number; userId: number; parentCommentId?: number | null; content: string }): Promise<Comment> {
    return this.commentRepository.createComment(payload);
  }

  findByReport(reportId: number): Promise<Comment[]> {
    return this.commentRepository.findByReport(reportId);
  }

  findOne(id: number): Promise<Comment> {
    return this.commentRepository.findById(id);
  }

  update(id: number, payload: { content?: string; status?: CommentStatus | null }): Promise<Comment> {
    return this.commentRepository.updateComment(id, payload);
  }

  remove(id: number): Promise<void> {
    return this.commentRepository.softDelete(id);
  }
}
