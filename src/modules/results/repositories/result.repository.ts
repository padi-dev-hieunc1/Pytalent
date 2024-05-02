import { GameResultsEntity } from '@entities';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class GameResultsRepository extends Repository<GameResultsEntity> {
  constructor(private dataSource: DataSource) {
    super(GameResultsEntity, dataSource.createEntityManager());
  }
}
