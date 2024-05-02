import { CandidateAssessmentStatusEnum } from '@common/enum/candidate-assessment-status.enum';
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateCandidateAssessmentTable1711695786844
  implements MigrationInterface
{
  name = 'CreateCandidateAssessmentTable1711695786844';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'candidate_assessments',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'status',
            type: 'enum',
            enum: Object.values(CandidateAssessmentStatusEnum),
            default: `'${CandidateAssessmentStatusEnum.PENDING}'`,
          },
          {
            name: 'assessmentId',
            type: 'integer',
          },
          {
            name: 'candidateId',
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
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            columnNames: ['candidateId'],
            name: 'fk_candidate-assessment-candidate',
            referencedColumnNames: ['id'],
            referencedTableName: 'users',
            onDelete: 'CASCADE',
          }),
          new TableForeignKey({
            columnNames: ['assessmentId'],
            name: 'fk_candidate-assessment-assessment',
            referencedColumnNames: ['id'],
            referencedTableName: 'assessments',
            onDelete: 'CASCADE',
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('candidate_assessments');
  }
}
