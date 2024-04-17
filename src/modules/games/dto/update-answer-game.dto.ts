import { IsNotEmpty } from 'class-validator';

export class UpdateAnswerGameDto {
  @IsNotEmpty()
  gameId: number;

  @IsNotEmpty()
  questionId: number;

  @IsNotEmpty()
  candidate_answer: string;

  is_correct: number;
}
