import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '@entities/base.entity';
import { Users } from './users.entity';
import { CandidateAssessmentStatusEnum } from '@common/enum/candidate-assessment-status.enum';
import { Assessments } from './assessments.entity';

@Entity()
export class CandidateAssessments extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: CandidateAssessmentStatusEnum,
    default: CandidateAssessmentStatusEnum.PENDING,
  })
  status: CandidateAssessmentStatusEnum;

  @Column()
  candidateId: number;

  @Column()
  assessmentId: number;

  @ManyToOne(() => Users, (user) => user.candidateAssessment)
  @JoinColumn({ name: 'candidateId' })
  candidate: Users;

  @ManyToOne(() => Assessments, (assessment) => assessment.candidateAssessment)
  @JoinColumn({ name: 'assessmentId' })
  assessment: Assessments;
}
