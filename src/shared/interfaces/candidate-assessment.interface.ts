import { CandidateAssessmentStatusEnum } from '@common/enum/candidate-assessment-status.enum';

export interface CandidateAssessmentModel {
  id: number;
  candidateId: number;
  assessmentId: number;
  status: CandidateAssessmentStatusEnum;
  result: number;
}

export interface CandidateAssessmentInterface {
  candidateId: number;
  assessmentId: number;
  status: CandidateAssessmentStatusEnum;
}

export type CandidateAssessmentGetResponse = Omit<
  CandidateAssessmentModel,
  'id'
>;
