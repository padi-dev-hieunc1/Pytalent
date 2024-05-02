import { AssessmentStatusEnum } from '@common/enum/assessment-status.enum';

export interface CreateAssessmentInterface {
  name: string;
  start_time?: Date;
  end_time?: Date;
  status: AssessmentStatusEnum;
  hrId: number;
}
