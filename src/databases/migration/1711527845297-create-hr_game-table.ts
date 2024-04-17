import { GameCategoryEnum } from '@common/enum/game-category.enum';
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateHrGameTable1711527845297 implements MigrationInterface {
  name = 'CreateHrGameTable1711527845297';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'hr_games',
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
            name: 'hrId',
            type: 'integer',
          },
          {
            name: 'created_at',
            type: 'datetime',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            isNullable: true,
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['hrId'],
            name: 'fk_hr_game',
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('hr_games');
  }
}
