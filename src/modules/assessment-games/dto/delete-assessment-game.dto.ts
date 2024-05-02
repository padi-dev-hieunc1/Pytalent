import { IsNotEmpty } from 'class-validator';

export class DeleteAssessmentGameDto {
  @IsNotEmpty()
  gameId: number;
}
