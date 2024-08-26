import { HrGames } from '@entities/hr-games.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class HrGamesRepository extends Repository<HrGames> {
  constructor(private dataSource: DataSource) {
    super(HrGames, dataSource.createEntityManager());
  }

  async findAllGamesByHrId(hrId: number): Promise<any> {
    const hrGames = await this.find({
      where: {
        hrId: hrId,
      },
      relations: ['game'],
    });

    // Remove fields in hr-games, only return game information
    const games = hrGames.map((hrGame) => hrGame.game);

    return games;
  }

  async findAllHrGames(): Promise<any> {
    const hrGames = await this.find({
      select: {
        id: true,
        hrId: true,
        gameId: true,
      },
      relations: ['hr', 'game'],
    });

    return hrGames.map((hrGame) => {
      const {
        createdAt: hrCreatedAt,
        updatedAt: hrUpdatedAt,
        ...hr
      } = hrGame.hr;

      const {
        createdAt: gameCreatedAt,
        updatedAt: gameUpdatedAt,
        ...game
      } = hrGame.game;

      return {
        ...hrGame,
        hr: hr,
        game: game,
      };
    });
  }
}
