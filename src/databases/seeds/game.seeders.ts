import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { GamesEntity } from '@entities/index';
import { GameCategoryEnum } from '@common/enum/game-category.enum';

export default class CreateGames implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const current = new Date();
    const firstThisWeek = current.getDate() - current.getDay() + 1;
    const games = [
      {
        id: 1,
        category: GameCategoryEnum.LOGICAL,
        time_limit: 90,
        total_question_level: 20,
        created_at: new Date(
          new Date().setDate(firstThisWeek - 7),
        ).toISOString(),
        updated_at: new Date(
          new Date().setDate(firstThisWeek - 7),
        ).toISOString(),
      },
      {
        id: 2,
        category: GameCategoryEnum.MEMORY,
        time_limit: 0,
        total_question_level: 25,
        created_at: new Date(
          new Date().setDate(firstThisWeek - 7),
        ).toISOString(),
        updated_at: new Date(
          new Date().setDate(firstThisWeek - 7),
        ).toISOString(),
      },
    ];
    await connection
      .createQueryBuilder()
      .insert()
      .into(GamesEntity)
      .values(games)
      .execute();
  }
}
