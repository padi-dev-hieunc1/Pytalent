import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateAssessmentGameTable1713451933652
  implements MigrationInterface
{
  name = 'CreateAssessmentGameTable1713451933652';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'assessment_games',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
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
            columnNames: ['gameId'],
            name: 'fk_assessment_game-game',
            referencedColumnNames: ['id'],
            referencedTableName: 'games',
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['assessmentId'],
            name: 'fk_assessment_game-assessment',
            referencedColumnNames: ['id'],
            referencedTableName: 'assessments',
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('assessment_games');
  }
}
