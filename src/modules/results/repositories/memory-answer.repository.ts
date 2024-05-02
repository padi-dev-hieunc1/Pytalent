import { MemoryAnswersEntity } from '@entities';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class MemoryAnswersRepository extends Repository<MemoryAnswersEntity> {
  constructor(private dataSource: DataSource) {
    super(MemoryAnswersEntity, dataSource.createEntityManager());
  }
}
