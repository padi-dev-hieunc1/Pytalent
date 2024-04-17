import { AssessmentStatusEnum } from '@common/enum/assessment-status.enum';

export interface AssessmentModel {
  id: number;
  name: string;
  start_time: Date;
  end_time: Date;
  status: AssessmentStatusEnum;
}

export interface CreateAssessmentInterface {
  id: number;
  name: string;
  start_time: Date;
  end_time: Date;
  status: AssessmentStatusEnum;
  hrId: number;
}

export type AssessmentGetResponse = Omit<AssessmentModel, ''>;
