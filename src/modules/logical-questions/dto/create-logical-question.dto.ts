import { LogicalResultEnum } from '@common/enum/logical-result.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateLogicalQuestionDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  firstStatement: string;

  @IsNotEmpty()
  secondStatement: string;

  @IsNotEmpty()
  conclusion: string;

  @IsNotEmpty()
  score: number;

  @IsNotEmpty()
  @IsEnum(LogicalResultEnum)
  result: LogicalResultEnum;
}
