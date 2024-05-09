import { LogicalResultEnum } from '@common/enum/logical-result.enum';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateLogicalQuestionTable1711963424819
  implements MigrationInterface
{
  name = 'CreateLogicalQuestionTable1711963424819';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'logical_questions',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'title',
            type: 'varchar(255)',
          },
          {
            name: 'first_statement',
            type: 'varchar(255)',
          },
          {
            name: 'second_statement',
            type: 'varchar(255)',
          },
          {
            name: 'conclusion',
            type: 'varchar(255)',
          },
          {
            name: 'result',
            type: 'enum',
            enum: Object.values(LogicalResultEnum),
          },
          {
            name: 'score',
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
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('logical_questions');
  }
}
