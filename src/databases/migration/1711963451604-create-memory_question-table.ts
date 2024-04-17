import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMemoryQuestionTable1711963451604
  implements MigrationInterface
{
  name = 'CreateMemoryQuestionTable1711963451604';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'memory_questions',
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
            type: 'text',
          },
          {
            name: 'arrow_count',
            type: 'integer',
          },
          {
            name: 'time_limit',
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
        uniques: [
          {
            name: 'title_unique',
            columnNames: ['title'],
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('memory_questions');
  }
}
