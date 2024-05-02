import { AnswerStatusEnum } from '@common/enum/answer-status.enum';

export interface CreateInitialLogicalAnswerInterface {
  resultId: number;
  questionId: number;
  status: AnswerStatusEnum;
}

export interface AnswerLogicalQuestionInterface {
  candidate_answer?: string;
}

export interface MemoryAnswerInterface {
  candidate_answer: string;
}
