import { IsOptional } from 'class-validator';

export class UpdateLogicalAnswerDto {
  @IsOptional()
  candidateAnswer: string;
}
