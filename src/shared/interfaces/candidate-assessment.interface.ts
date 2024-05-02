import { CandidateAssessmentStatusEnum } from '@common/enum/candidate-assessment-status.enum';

export interface CandidateAssessmentInterface {
  candidateId: number;
  assessmentId: number;
  status: CandidateAssessmentStatusEnum;
}
