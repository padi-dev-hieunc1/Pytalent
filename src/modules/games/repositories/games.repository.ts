import { Games } from '@entities/games.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class GamesRepository extends Repository<Games> {
  constructor(private dataSource: DataSource) {
    super(Games, dataSource.createEntityManager());
  }

  async findAllGames(): Promise<any> {
    return await this.find({
      select: {
        id: true,
        category: true,
        timeLimit: true,
        totalQuestionLevel: true,
      },
    });
  }
}
