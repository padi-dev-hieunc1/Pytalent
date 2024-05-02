import { IsNotEmpty } from 'class-validator';

export class CreateAssessmentGameDto {
  @IsNotEmpty()
  assessmentId: number;

  @IsNotEmpty()
  gameId: number;
}
