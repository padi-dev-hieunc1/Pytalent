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

  @Column({
    name: 'candidate_answer',
  })
  candidateAnswer: string;

  @Column({
    name: 'is_correct',
    default: 0,
  })
  isCorrect: number;

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

  @ManyToOne(() => GameResults, (gameResult) => gameResult.logicalAnswer, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'resultId' })
  gameResult: GameResults;

  @ManyToOne(
    () => LogicalQuestions,
    (logicalQuestion) => logicalQuestion.logicalAnswer,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'questionId' })
  logicalQuestion: LogicalQuestions;
}
