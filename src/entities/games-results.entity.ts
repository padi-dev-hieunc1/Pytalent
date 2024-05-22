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
import { Assessments } from './assessments.entity';
import { Users } from './users.entity';
import { GameResultStatusEnum } from '@common/enum/game-result-status.enum';
import { Games } from './games.entity';
import { LogicalAnswers } from './logical-answers.entity';
import { MemoryAnswers } from './memory-answers.entity';

@Entity()
export class GameResults extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  complete_time: number;

  @Column()
  complete_question: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: GameResultStatusEnum,
  })
  status: GameResultStatusEnum;

  @Column()
  score: number;

  @Column()
  current_question_level: number;

  // @Column()
  // is_playing: number;

  @Column()
  assessmentId: number;

  @Column()
  gameId: number;

  @Column()
  candidateId: number;

  @ManyToOne(() => Assessments, (assessment) => assessment.game_result, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assessmentId' })
  assessment: Assessments;

  @ManyToOne(() => Games, (game) => game.game_result, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'gameId' })
  game: Games;

  @ManyToOne(() => Users, (user) => user.game_result, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'candidateId' })
  candidate: Users;

  @OneToMany(
    () => LogicalAnswers,
    (logical_answer) => logical_answer.game_result,
  )
  logical_answer: LogicalAnswers[];

  @OneToMany(() => MemoryAnswers, (memory_answer) => memory_answer.game_result)
  memory_answer: MemoryAnswers[];
}
