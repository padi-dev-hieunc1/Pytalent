import { GameResults } from '@entities/games-results.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class GameResultsRepository extends Repository<GameResults> {
  constructor(private dataSource: DataSource) {
    super(GameResults, dataSource.createEntityManager());
  }
}
