import { IsEnum, IsNotEmpty } from 'class-validator';
import { CandidateAssessmentStatusEnum } from '@common/enum/candidate-assessment-status.enum';

export class CandidateAssessmentDto {
  @IsNotEmpty()
  list_candidate_emails: string[];

  @IsNotEmpty()
  assessmentId: number;

  @IsNotEmpty()
  @IsEnum(CandidateAssessmentStatusEnum)
  status: CandidateAssessmentStatusEnum;
}
