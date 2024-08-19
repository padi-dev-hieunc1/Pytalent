import { AssessmentStatusEnum } from '@common/enum/assessment-status.enum';

export interface CreateAssessmentInterface {
  name: string;
  startTime?: Date;
  endTime?: Date;
  status: AssessmentStatusEnum;
  hrId: number;
}
