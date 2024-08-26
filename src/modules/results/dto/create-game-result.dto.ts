import { GameResultStatusEnum } from '@common/enum/game-result-status.enum';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateGameResultDto {
  @IsNotEmpty()
  assessmentId: number;

  @IsNotEmpty()
  gameId: number;

  @IsNotEmpty()
  candidateId: number;

  @IsOptional()
  @IsEnum(GameResultStatusEnum)
  status: GameResultStatusEnum;

  @IsOptional()
  currentQuestionLevel: number;
}
