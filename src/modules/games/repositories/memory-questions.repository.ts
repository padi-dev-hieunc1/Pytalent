import { MemoryQuestionsEntity } from '@entities';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class MemoryQuestionsRepository extends Repository<MemoryQuestionsEntity> {
  constructor(private dataSource: DataSource) {
    super(MemoryQuestionsEntity, dataSource.createEntityManager());
  }
}
