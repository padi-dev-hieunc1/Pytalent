import { Body, Controller, Param, Patch, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import { Response } from 'express';
import { BaseController } from '@modules/app/base.controller';
import { AuthorizationGuard } from '@guards/authorization.guard';
import { RoleEnum } from '@enum/role.enum';
import { GameResultsService } from '../services/result.service';
import { MemoryAnswersService } from '../services/memory-answer.service';
import { UpdateMemoryAnswerDto } from '../dto/update-memory-answer.dto';
import { AnswerStatusEnum } from '@common/enum/answer-status.enum';

@Controller('api/v1/memory')
export class MemoryAnswersController extends BaseController {
  constructor(
    private readonly gameResultService: GameResultsService,
    private readonly memoryAnswerService: MemoryAnswersService,
  ) {
    super();
  }

  @Patch('/:resultId/answer/:level')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.CANDIDATE]))
  async answerMemoryQuestion(
    @Param('resultId') resultId: number,
    @Param('level') level: number,
    @Body() updateMemoryAnswer: UpdateMemoryAnswerDto,
    @Res() res: Response,
  ) {
    const memory_answer = await this.memoryAnswerService.updateMemoryAnswer(
      resultId,
      level,
      updateMemoryAnswer,
    );

    if (
      memory_answer.status === AnswerStatusEnum.DONE &&
      memory_answer.is_correct === 0
    ) {
      const game_result = await this.gameResultService.getDetailGameResult(
        resultId,
      );

      return this.successResponse(
        {
          data: {
            game_result: game_result,
          },
          message: 'End game',
        },
        res,
      );
    } else if (
      memory_answer.status === AnswerStatusEnum.DONE &&
      memory_answer.is_correct === 1
    ) {
      await this.gameResultService.updateGameResult(resultId, 1);

      if (level === 25) {
        await this.gameResultService.updateGameResultStatus(resultId);

        const game_result = await this.gameResultService.getDetailGameResult(
          resultId,
        );

        return this.successResponse(
          {
            data: {
              game_result: game_result,
            },
            message: 'End game',
          },
          res,
        );
      } else {
        const next_memory_question =
          await this.memoryAnswerService.createMemoryAnswer(
            resultId,
            level + 1,
          );

        return this.successResponse(
          {
            data: {
              question: next_memory_question,
            },
            message: 'Complete previous level',
          },
          res,
        );
      }
    } else {
      return this.successResponse(
        {
          data: {
            question: memory_answer,
          },
          message: 'Continue this level',
        },
        res,
      );
    }
  }
}
