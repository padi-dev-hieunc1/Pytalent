import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
