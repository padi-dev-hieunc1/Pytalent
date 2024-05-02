import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { AssessmentStatusEnum } from '@common/enum/assessment-status.enum';

export class CreateAssessmentDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  start_time?: Date;

  @IsOptional()
  end_time?: Date;

  @IsNotEmpty()
  @IsEnum(AssessmentStatusEnum)
  status: AssessmentStatusEnum;

  @IsNotEmpty()
  hrId: number;
}
