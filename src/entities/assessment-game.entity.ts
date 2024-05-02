import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '@entities/base.entity';
import { Assessments } from './assessments.entity';
import { Games } from './games.entity';

@Entity()
export class AssessmentGames extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  assessmentId: number;

  @Column()
  gameId: number;

  @ManyToOne(() => Games, (game) => game.assessment_game)
  @JoinColumn({ name: 'gameId' })
  game: Games;

  @ManyToOne(() => Assessments, (assessment) => assessment.assessment_game)
  @JoinColumn({ name: 'assessmentId' })
  assessment: Assessments;
}
