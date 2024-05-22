import { LogicalResultEnum } from '@common/enum/logical-result.enum';

export interface CreateLogicalQuestionInterface {
  title: string;
  first_statement: string;
  second_statement: string;
  conclusion: string;
  score: number;
  result: LogicalResultEnum;
}
