import { IsOptional } from 'class-validator';

export class UpdateLogicalAnswerDto {
  @IsOptional()
  candidate_answer: string;
}
