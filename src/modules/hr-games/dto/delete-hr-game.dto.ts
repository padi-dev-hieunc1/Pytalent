import { IsNotEmpty } from 'class-validator';

export class DeleteHrGameDto {
  @IsNotEmpty()
  gameId: number;
}
