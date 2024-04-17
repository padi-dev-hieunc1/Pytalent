import { GameCategoryEnum } from '@common/enum/game-category.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateHrGameDto {
  @IsNotEmpty()
  hrId: number;

  @IsNotEmpty()
  @IsEnum(GameCategoryEnum)
  category: GameCategoryEnum;
}
