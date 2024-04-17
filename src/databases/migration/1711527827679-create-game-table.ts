import { GameCategoryEnum } from '@common/enum/game-category.enum';
import { GameStatusEnum } from '@common/enum/game-status.enum';
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateGameTable1711527827679 implements MigrationInterface {
  name = 'CreateGameTable1711527827679';

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
            type: 'varchar(255)',
            isNullable: true,
          },
          {
            name: 'total_question_level',
            type: 'integer',
          },
          {
            name: 'max_score_level',
            type: 'integer',
          },
          {
            name: 'questions',
            type: 'varchar(255)',
          },
          {
            name: 'complete_time',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'complete_question',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: Object.values(GameStatusEnum),
          },
          {
            name: 'score',
            type: 'integer',
          },
          {
            name: 'candidate_email',
            type: 'varchar(255)',
          },
          {
            name: 'assessmentId',
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
            columnNames: ['assessmentId'],
            name: 'fk_game_assessment',
            referencedColumnNames: ['id'],
            referencedTableName: 'assessments',
            onDelete: 'CASCADE',
          }),
        ],
        uniques: [
          {
            name: 'candidate_email_unique',
            columnNames: ['candidate_email'],
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('games');
  }
}
