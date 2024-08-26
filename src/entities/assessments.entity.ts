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
import { GameResults } from './games-results.entity';
import { AssessmentGames } from './assessment-game.entity';

@Entity()
export class Assessments extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'start_time', nullable: true })
  startTime: Date;

  @Column({ name: 'end_time', nullable: true })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: AssessmentStatusEnum,
    default: AssessmentStatusEnum.INFINITE,
  })
  status: AssessmentStatusEnum;

  @Column({
    name: 'max_score',
  })
  maxScore: number;

  @Column({
    default: 0,
  })
  archive: number;

  @Column()
  hrId: number;

  @ManyToOne(() => Users, (hr) => hr.assessment)
  @JoinColumn({ name: 'hrId' })
  hr: Users;

  @OneToMany(
    () => CandidateAssessments,
    (candidateAssessment) => candidateAssessment.assessment,
  )
  candidateAssessment: CandidateAssessments[];

  @OneToMany(
    () => AssessmentGames,
    (assessmentGame) => assessmentGame.assessment,
  )
  assessmentGame: AssessmentGames[];

  @OneToMany(() => GameResults, (gameResult) => gameResult.assessment)
  gameResult: GameResults[];
}
