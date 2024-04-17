import { GameCategoryEnum } from '@common/enum/game-category.enum';
import { GameStatusEnum } from '@common/enum/game-status.enum';

export interface LogicalGameModel {
  id: number;
  category: GameCategoryEnum;
  time_limit: number;
  total_question_level: number;
  max_score_level: number;
  questions: string;
}

export interface CreateLogicalGameInterface {
  category: GameCategoryEnum;
  time_limit: number;
  total_question_level: number;
  max_score_level: number;
  questions: string;
  assessmentId: number;
  candidate_email: string;
  status: GameStatusEnum;
  created_at: Date;
  updated_at: Date;
}

export interface CreateMemoryGameInterface {
  category: GameCategoryEnum;
  total_question_level: number;
  max_score_level: number;
  assessmentId: number;
  candidate_email: string;
  status: GameStatusEnum;
  created_at: Date;
  updated_at: Date;
}

export interface UpdateStatusGameInterface {
  status: GameStatusEnum;
}

export type HrGameGetResponse = Omit<LogicalGameModel, 'id'>;
