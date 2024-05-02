import { IsNotEmpty } from 'class-validator';

export class CreateHrGameDto {
  @IsNotEmpty()
  hrId: number;

  @IsNotEmpty()
  gameId: number;
}
