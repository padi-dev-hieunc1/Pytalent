import { AnswerGamesEntity } from '@entities';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AnswerGamesRepository extends Repository<AnswerGamesEntity> {
  constructor(private dataSource: DataSource) {
    super(AnswerGamesEntity, dataSource.createEntityManager());
  }

  async findAllAnswer(gameId: number): Promise<any> {
    return await this.find({
      where: {
        gameId: gameId,
      },
    });
  }
}
