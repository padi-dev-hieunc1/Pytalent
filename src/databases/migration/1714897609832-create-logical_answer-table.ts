import { AnswerStatusEnum } from '@common/enum/answer-status.enum';
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateLogicalAnswerTable1714897609832
  implements MigrationInterface
{
  name = 'CreateLogicalAnswerTable1714897609832';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'logical_answers',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'candidate_answer',
            type: 'varchar(255)',
            isNullable: true,
          },
          {
            name: 'is_correct',
            type: 'integer',
          },
          {
            name: 'status',
            type: 'enum',
            enum: Object.values(AnswerStatusEnum),
          },
          {
            name: 'resultId',
            type: 'integer',
          },
          {
            name: 'questionId',
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
            columnNames: ['resultId'],
            name: 'fk_logical_answer-game_result',
            referencedColumnNames: ['id'],
            referencedTableName: 'game_results',
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['questionId'],
            name: 'fk_logical_answer-logical_question',
            referencedColumnNames: ['id'],
            referencedTableName: 'logical_questions',
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('logical_answers');
  }
}
