import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateHrGameTable1714897122801 implements MigrationInterface {
  name = 'CreateHrGameTable1714897122801';

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
            name: 'gameId',
            type: 'integer',
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
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['hrId'],
            name: 'fk_hr_game-hr',
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
          }),
          new TableForeignKey({
            columnNames: ['gameId'],
            name: 'fk_hr_game-game',
            referencedColumnNames: ['id'],
            referencedTableName: 'games',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('hr_games');
  }
}
