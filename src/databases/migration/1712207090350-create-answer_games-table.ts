import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateAnswerGamesTable1712207090350 implements MigrationInterface {
  name = 'CreateAnswerGamesTable1712207090350';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'answer_games',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'gameId',
            type: 'integer',
          },
          {
            name: 'questionId',
            type: 'integer',
          },
          {
            name: 'candidate_answer',
            type: 'varchar(255)',
            isNullable: true,
          },
          {
            name: 'is_correct',
            type: 'integer',
            isNullable: true,
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
            columnNames: ['gameId'],
            name: 'fk_answer_game',
            referencedColumnNames: ['id'],
            referencedTableName: 'games',
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('answer_games');
  }
}
