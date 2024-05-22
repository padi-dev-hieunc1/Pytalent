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
  max_score: number;

  @Column()
  archive: number;

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

  @OneToMany(
    () => AssessmentGames,
    (assessment_game) => assessment_game.assessment,
  )
  assessment_game: AssessmentGames[];

  @OneToMany(() => GameResults, (game_result) => game_result.assessment)
  game_result: GameResults[];
}
