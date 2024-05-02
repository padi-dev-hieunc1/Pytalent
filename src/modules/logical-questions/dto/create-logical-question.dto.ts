import { LogicalResultEnum } from '@common/enum/logical-result.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateLogicalQuestionDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  first_statement: string;

  @IsNotEmpty()
  second_statement: string;

  @IsNotEmpty()
  conclusion: string;

  @IsNotEmpty()
  @IsEnum(LogicalResultEnum)
  result: LogicalResultEnum;
}
