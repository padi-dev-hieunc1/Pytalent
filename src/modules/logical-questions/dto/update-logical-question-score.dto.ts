import { IsNotEmpty } from 'class-validator';

export class UpdateLogicalQuestionScoreDto {
  @IsNotEmpty()
  score: number;
}
