import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@entities/base.entity';
import { GameCategoryEnum } from '@common/enum/game-category.enum';
import { HrGames } from './hr-games.entity';
import { AssessmentGames } from './assessment-game.entity';
import { GameResults } from './games-results.entity';

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

  @Column({
    name: 'time_limit',
  })
  timeLimit: number;

  @Column({
    name: 'total_question_level',
  })
  totalQuestionLevel: number;

  @OneToMany(() => HrGames, (hrGame) => hrGame.game)
  hrGame: HrGames[];

  @OneToMany(() => AssessmentGames, (assessmentGame) => assessmentGame.game)
  assessmentGame: AssessmentGames[];

  @OneToMany(() => GameResults, (gameResult) => gameResult.game)
  gameResult: GameResults[];
}
