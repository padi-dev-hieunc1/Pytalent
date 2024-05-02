import { HrGamesEntity } from '@entities';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class HrGamesRepository extends Repository<HrGamesEntity> {
  constructor(private dataSource: DataSource) {
    super(HrGamesEntity, dataSource.createEntityManager());
  }

  async findAllGamesByHrId(hrId: number): Promise<any> {
    const hr_games = await this.find({
      where: {
        hrId: hrId,
      },
      relations: ['game'],
    });

    // Remove fields in hr-games, only return game information
    const games = hr_games.map((hr_game) => hr_game.game);

    return games;
  }

  async findAllHrGames(): Promise<any> {
    return await this.find({
      relations: ['hr', 'game'],
    });
  }
}
