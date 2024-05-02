import { LogicalAnswersEntity } from '@entities';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class LogicalAnswersRepository extends Repository<LogicalAnswersEntity> {
  constructor(private dataSource: DataSource) {
    super(LogicalAnswersEntity, dataSource.createEntityManager());
  }
}
