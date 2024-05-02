import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '@entities/base.entity';
import { GameResults } from './games-results.entity';
import { LogicalQuestions } from './logical-questions.entity';
import { AnswerStatusEnum } from '@common/enum/answer-status.enum';

@Entity()
export class LogicalAnswers extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  candidate_answer: string;

  @Column({
    default: 0,
  })
  is_correct: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AnswerStatusEnum,
    default: AnswerStatusEnum.SKIP,
  })
  status: AnswerStatusEnum;

  @Column()
  resultId: number;

  @Column()
  questionId: number;

  @ManyToOne(() => GameResults, (game_result) => game_result.logical_answer, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'resultId' })
  game_result: GameResults;

  @ManyToOne(
    () => LogicalQuestions,
    (logical_question) => logical_question.logical_answer,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'questionId' })
  logical_question: LogicalQuestions;
}
