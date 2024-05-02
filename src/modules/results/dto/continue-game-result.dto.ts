import { IsNotEmpty } from 'class-validator';

export class ContinueGameResultDto {
  @IsNotEmpty()
  assessmentId: number;

  @IsNotEmpty()
  gameId: number;

  @IsNotEmpty()
  candidateId: number;
}
