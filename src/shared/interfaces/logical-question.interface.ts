import { LogicalResultEnum } from '@common/enum/logical-result.enum';

export interface CreateLogicalQuestionInterface {
  title: string;
  firstStatement: string;
  secondStatement: string;
  conclusion: string;
  score: number;
  result: LogicalResultEnum;
}
