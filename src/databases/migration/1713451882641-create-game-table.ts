import { GameCategoryEnum } from '@common/enum/game-category.enum';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateGameTable1713451882641 implements MigrationInterface {
  name = 'CreateGameTable1713451882641';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'games',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'category',
            type: 'enum',
            enum: Object.values(GameCategoryEnum),
          },
          {
            name: 'time_limit',
            type: 'integer',
          },
          {
            name: 'total_question_level',
            type: 'varchar(255)',
          },
          {
            name: 'created_at',
            type: 'datetime',
          },
          {
            name: 'updated_at',
            type: 'datetime',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('games');
  }
}
