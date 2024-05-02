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

  @Column()
  time_limit: number;

  @Column()
  is_correct: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AnswerStatusEnum,
    default: AnswerStatusEnum.SKIP,
  })
  status: AnswerStatusEnum;

  @Column()
  candidate_answer: string;

  @Column()
  resultId: number;

  @ManyToOne(() => GameResults, (game_result) => game_result.memory_answer, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'resultId' })
  game_result: GameResults;
}
