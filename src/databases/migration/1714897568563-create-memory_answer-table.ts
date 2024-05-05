import { AnswerStatusEnum } from '@common/enum/answer-status.enum';
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateMemoryAnswerTable1714897568563
  implements MigrationInterface
{
  name = 'CreateMemoryAnswerTable1714897568563';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'memory_answers',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'level',
            type: 'integer',
          },
          {
            name: 'title',
            type: 'varchar(255)',
          },
          {
            name: 'time_limit',
            type: 'integer',
          },
          {
            name: 'status',
            type: 'enum',
            enum: Object.values(AnswerStatusEnum),
            default: `'${AnswerStatusEnum.SKIP}'`,
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
            name: 'resultId',
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
            name: 'fk_memory_answer-game_result',
            referencedColumnNames: ['id'],
            referencedTableName: 'game_results',
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('memory_answers');
  }
}
