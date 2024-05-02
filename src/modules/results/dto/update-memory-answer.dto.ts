import { IsNotEmpty } from 'class-validator';

export class UpdateMemoryAnswerDto {
  @IsNotEmpty()
  candidate_answer: string;
}
