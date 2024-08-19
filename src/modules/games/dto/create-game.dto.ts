import { GameCategoryEnum } from '@common/enum/game-category.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateGameDto {
  @IsNotEmpty()
  @IsEnum(GameCategoryEnum)
  category: GameCategoryEnum;

  @IsNotEmpty()
  timeLimit: number;

  @IsNotEmpty()
  totalQuestionLevel: number;
}
