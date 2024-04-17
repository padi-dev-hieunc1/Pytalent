import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@entities/base.entity';
import { GameCategoryEnum } from '@common/enum/game-category.enum';
import { GameStatusEnum } from '@common/enum/game-status.enum';
import { Assessments } from './assessments.entity';
import { AnswerGames } from './answer-games.entity';

@Entity()
export class Games extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'category',
    type: 'enum',
    enum: GameCategoryEnum,
  })
  category: GameCategoryEnum;

  @Column()
  time_limit: number;

  @Column()
  total_question_level: number;

  @Column()
  max_score_level: number;

  @Column()
  questions: string;

  @Column()
  complete_time: number;

  @Column()
  complete_question: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: GameStatusEnum,
  })
  status: GameStatusEnum;

  @Column()
  score: number;

  @Column()
  candidate_email: string;

  @Column()
  assessmentId: number;

  @ManyToOne(() => Assessments, (assessment) => assessment.game, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assessmentId' })
  assessment: Assessments;

  @OneToMany(() => AnswerGames, (answer) => answer.game)
  answer: AnswerGames[];
}
