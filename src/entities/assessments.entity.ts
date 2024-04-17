import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@entities/base.entity';
import { AssessmentStatusEnum } from '@common/enum/assessment-status.enum';
import { Users } from './users.entity';
import { CandidateAssessments } from './candidate-assessment';
import { Games } from './games.entity';

@Entity()
export class Assessments extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  start_time: Date;

  @Column({ nullable: true })
  end_time: Date;

  @Column({
    type: 'enum',
    enum: AssessmentStatusEnum,
    default: AssessmentStatusEnum.INFINITE,
  })
  status: AssessmentStatusEnum;

  @Column()
  max_result: number;

  @Column()
  hrId: number;

  @ManyToOne(() => Users, (hr) => hr.assessment)
  @JoinColumn({ name: 'hrId' })
  hr: Users;

  @OneToMany(
    () => CandidateAssessments,
    (candidate_assessment) => candidate_assessment.assessment,
  )
  candidate_assessment: CandidateAssessments[];

  @OneToMany(() => Games, (game) => game.assessment)
  game: Games[];
}
