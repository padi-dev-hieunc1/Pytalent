import { LogicalQuestionsEntity } from '@entities';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class LogicalQuestionsRepository extends Repository<LogicalQuestionsEntity> {
  constructor(private dataSource: DataSource) {
    super(LogicalQuestionsEntity, dataSource.createEntityManager());
  }
}
