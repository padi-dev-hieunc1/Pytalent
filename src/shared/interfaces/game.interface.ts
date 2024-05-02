import { GameCategoryEnum } from '@common/enum/game-category.enum';

export interface CreateGameInterface {
  category: GameCategoryEnum;
  time_limit: number;
  total_question_level: number;
}
