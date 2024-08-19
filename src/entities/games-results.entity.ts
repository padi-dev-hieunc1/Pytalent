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

  @Column({
    name: 'complete_time',
  })
  completeTime: number;

  @Column({
    name: 'complete_question',
  })
  completeQuestion: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: GameResultStatusEnum,
  })
  status: GameResultStatusEnum;

  @Column()
  score: number;

  @Column({
    name: 'current_question_level',
  })
  currentQuestionLevel: number;

  @Column()
  assessmentId: number;

  @Column()
  gameId: number;

  @Column()
  candidateId: number;

  @ManyToOne(() => Assessments, (assessment) => assessment.gameResult, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'assessmentId' })
  assessment: Assessments;

  @ManyToOne(() => Games, (game) => game.gameResult, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'gameId' })
  game: Games;

  @ManyToOne(() => Users, (user) => user.gameResult, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'candidateId' })
  candidate: Users;

  @OneToMany(() => LogicalAnswers, (logicalAnswer) => logicalAnswer.gameResult)
  logicalAnswer: LogicalAnswers[];

  @OneToMany(() => MemoryAnswers, (memoryAnswer) => memoryAnswer.gameResult)
  memoryAnswer: MemoryAnswers[];
}
