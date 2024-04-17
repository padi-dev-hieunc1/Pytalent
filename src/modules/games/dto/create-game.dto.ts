import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateGameDto {
  @IsNotEmpty()
  assessmentId: number;

  @IsNotEmpty()
  @IsEmail()
  candidate_email: string;
}
