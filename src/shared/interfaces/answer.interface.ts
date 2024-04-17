export interface AnswerGamesModel {
  id: number;
  gameId: number;
  questionId: number;
  candidate_answer: string;
  is_correct: number;
}

export interface CreateInitialAnswerInterface {
  gameId: number;
  questionId: number;
}

export interface UpdateAnswerInterface {
  gameId: number;
  questionId: number;
  candidate_answer: string;
  is_correct: number;
}

export type AssessmentGetResponse = Omit<AnswerGamesModel, 'id'>;
