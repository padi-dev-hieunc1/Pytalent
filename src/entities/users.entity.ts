import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@entities/base.entity';
import { RoleEnum } from '@enum/role.enum';
import { Assessments } from './assessments.entity';
import { HrGames } from './hr-games.entity';
import { CandidateAssessments } from './candidate-assessment';
import { GameResults } from './games-results.entity';

@Entity()
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'email' })
  @Index({ unique: true })
  email: string;

  @Column({ name: 'password' })
  password: string;

  @Column({ name: 'username' })
  username: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: RoleEnum,
    default: RoleEnum.HR,
  })
  role: RoleEnum;

  @OneToMany(() => Assessments, (assessment) => assessment.hr)
  assessment: Assessments[];

  @OneToMany(() => HrGames, (hr_game) => hr_game.hr)
  hr_game: HrGames[];

  @OneToMany(
    () => CandidateAssessments,
    (candidate_assessment) => candidate_assessment.candidate,
  )
  candidate_assessment: CandidateAssessments[];

  @OneToMany(() => GameResults, (game_result) => game_result.candidate)
  game_result: GameResults[];
}
