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

  @Column()
  time_limit: number;

  @Column()
  total_question_level: number;

  @OneToMany(() => HrGames, (hr_game) => hr_game.game)
  hr_game: HrGames[];

  @OneToMany(() => AssessmentGames, (assessment_game) => assessment_game.game)
  assessment_game: AssessmentGames[];

  @OneToMany(() => GameResults, (game_result) => game_result.game)
  game_result: GameResults[];
}
