import { GameResultStatusEnum } from '@common/enum/game-result-status.enum';

export interface CreateInitialGameResultInterface {
  assessmentId: number;
  gameId: number;
  candidateId: number;
  status?: GameResultStatusEnum;
  current_question_level?: number;
}

export interface UpdateGameResultInterface {
  status?: GameResultStatusEnum;
  complete_question?: number;
  complete_time?: number;
  current_question_level?: number;
  score?: number;
}

export interface ContinueGameResultInterface {
  assessmentId: number;
  gameId: number;
  candidateId: number;
}
