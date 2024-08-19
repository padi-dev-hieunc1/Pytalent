import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { AssessmentStatusEnum } from '@common/enum/assessment-status.enum';

export class CreateAssessmentDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  startTime?: Date;

  @IsOptional()
  endTime?: Date;

  @IsNotEmpty()
  @IsEnum(AssessmentStatusEnum)
  status: AssessmentStatusEnum;

  @IsNotEmpty()
  hrId: number;
}
