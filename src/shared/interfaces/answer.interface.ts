import { AnswerStatusEnum } from '@common/enum/answer-status.enum';

export interface CreateInitialLogicalAnswerInterface {
  resultId: number;
  questionId: number;
  status: AnswerStatusEnum;
}

export interface AnswerLogicalQuestionInterface {
  candidateAnswer?: string;
}

export interface MemoryAnswerInterface {
  candidateAnswer: string;
}
