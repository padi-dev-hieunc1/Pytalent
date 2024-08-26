import { LogicalAnswers } from '@entities/logical-answers.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class LogicalAnswersRepository extends Repository<LogicalAnswers> {
  constructor(private dataSource: DataSource) {
    super(LogicalAnswers, dataSource.createEntityManager());
  }
}
