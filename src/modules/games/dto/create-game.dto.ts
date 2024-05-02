import { GameCategoryEnum } from '@common/enum/game-category.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateGameDto {
  @IsNotEmpty()
  @IsEnum(GameCategoryEnum)
  category: GameCategoryEnum;

  @IsNotEmpty()
  time_limit: number;

  @IsNotEmpty()
  total_question_level: number;
}
