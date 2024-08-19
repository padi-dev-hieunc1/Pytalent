import { GameCategoryEnum } from '@common/enum/game-category.enum';

export interface CreateGameInterface {
  category: GameCategoryEnum;
  timeLimit: number;
  totalQuestionLevel: number;
}
