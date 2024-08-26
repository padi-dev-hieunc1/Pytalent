import { GameResultStatusEnum } from '@common/enum/game-result-status.enum';

export interface CreateInitialGameResultInterface {
  assessmentId: number;
  gameId: number;
  candidateId: number;
  status?: GameResultStatusEnum;
  currentQuestionLevel?: number;
}

export interface UpdateGameResultInterface {
  status?: GameResultStatusEnum;
  completeQuestion?: number;
  completeTime?: number;
  currentQuestionLevel?: number;
  score?: number;
}

export interface ContinueGameResultInterface {
  assessmentId: number;
  gameId: number;
  candidateId: number;
}
