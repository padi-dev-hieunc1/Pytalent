export interface CreateInitialLogicalAnswerInterface {
  resultId: number;
  questionId: number;
}

export interface AnswerLogicalQuestionInterface {
  candidateAnswer?: string;
}

export interface MemoryAnswerInterface {
  candidateAnswer: string;
}
