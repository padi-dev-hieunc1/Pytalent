import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '@entities/base.entity';
import { GameResults } from './games-results.entity';
import { AnswerStatusEnum } from '@common/enum/answer-status.enum';

@Entity()
export class MemoryAnswers extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  level: number;

  @Column('text')
  title: string;

  @Column({
    name: 'time_limit',
  })
  timeLimit: number;

  @Column({
    name: 'is_correct',
  })
  isCorrect: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AnswerStatusEnum,
    default: AnswerStatusEnum.SKIP,
  })
  status: AnswerStatusEnum;

  @Column({
    name: 'candidate_answer',
  })
  candidateAnswer: string;

  @Column()
  resultId: number;

  @ManyToOne(() => GameResults, (gameResult) => gameResult.memoryAnswer, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'resultId' })
  gameResult: GameResults;
}
