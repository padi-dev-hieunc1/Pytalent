import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  // new password
  password: string;
}
