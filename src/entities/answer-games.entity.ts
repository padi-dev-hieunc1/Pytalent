import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '@entities/base.entity';
import { Games } from './games.entity';

@Entity()
export class AnswerGames extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gameId: number;

  @Column()
  questionId: number;

  @Column()
  candidate_answer: string;

  @Column()
  is_correct: number;

  @ManyToOne(() => Games, (game) => game.answer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gameId' })
  game: Games;
}
