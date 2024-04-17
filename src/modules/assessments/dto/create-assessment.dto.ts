import { IsEmpty, IsEnum, IsNotEmpty } from 'class-validator';
import { AssessmentStatusEnum } from '@common/enum/assessment-status.enum';

export class CreateAssessmentDto {
  @IsNotEmpty()
  name: string;

  @IsEmpty()
  start_time: Date;

  @IsEmpty()
  end_time: Date;

  @IsNotEmpty()
  @IsEnum(AssessmentStatusEnum)
  status: AssessmentStatusEnum;

  @IsNotEmpty()
  hrId: number;
}
