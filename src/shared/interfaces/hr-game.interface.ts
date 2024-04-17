import { GameCategoryEnum } from '@common/enum/game-category.enum';

export interface HrGameModel {
  id: number;
  hrId: number;
  category: GameCategoryEnum;
}

export interface CreateHrGameInterface {
  hrId: number;
  category: GameCategoryEnum;
}

export type HrGameGetResponse = Omit<HrGameModel, 'id'>;
