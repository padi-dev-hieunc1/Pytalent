import { IsNotEmpty } from 'class-validator';

export class UpdateMemoryAnswerDto {
  @IsNotEmpty()
  candidateAnswer: string;
}
