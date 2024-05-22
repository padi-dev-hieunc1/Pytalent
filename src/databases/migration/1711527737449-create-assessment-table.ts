import { AssessmentStatusEnum } from '@common/enum/assessment-status.enum';
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateAssessmentTable1711527737449 implements MigrationInterface {
  name = 'CreateAssessmentTable1711527737449';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'assessments',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar(255)',
          },
          {
            name: 'start_time',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'end_time',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: Object.values(AssessmentStatusEnum),
            default: `'${AssessmentStatusEnum.INFINITE}'`,
          },
          {
            name: 'max_score',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'archive',
            type: 'integer',
            default: 0,
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
            name: 'fk_assessment-hr',
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('assessments');
  }
}
