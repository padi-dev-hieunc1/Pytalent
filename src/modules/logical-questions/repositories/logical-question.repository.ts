import { LogicalQuestions } from '@entities/logical-questions.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class LogicalQuestionsRepository extends Repository<LogicalQuestions> {
  constructor(private dataSource: DataSource) {
    super(LogicalQuestions, dataSource.createEntityManager());
  }
}
