import { GameResultStatusEnum } from '@common/enum/game-result-status.enum';
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateGameResultTable1714897524158 implements MigrationInterface {
  name = 'CreateGameResultTable1714897524158';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'game_results',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'complete_time',
            type: 'integer',
          },
          {
            name: 'complete_question',
            type: 'integer',
          },
          {
            name: 'status',
            type: 'enum',
            enum: Object.values(GameResultStatusEnum),
          },
          {
            name: 'score',
            type: 'integer',
          },
          {
            name: 'current_question_level',
            type: 'integer',
          },
          {
            name: 'assessmentId',
            type: 'integer',
          },
          {
            name: 'gameId',
            type: 'integer',
          },
          {
            name: 'candidateId',
            type: 'integer',
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
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['candidateId'],
            name: 'fk_game_result-candidate',
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['assessmentId'],
            name: 'fk_game_result-assessment',
            referencedColumnNames: ['id'],
            referencedTableName: 'assessments',
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['gameId'],
            name: 'fk_game_result-game',
            referencedColumnNames: ['id'],
            referencedTableName: 'games',
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('game_results');
  }
}
