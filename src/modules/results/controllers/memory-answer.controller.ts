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
    const memoryAnswer = await this.memoryAnswerService.updateMemoryAnswer(
      resultId,
      level,
      updateMemoryAnswer,
    );

    if (memoryAnswer.status !== AnswerStatusEnum.DONE) {
      return this.successResponse(
        {
          data: {
            check: true,
            question: {
              id: memoryAnswer.id,
              level: memoryAnswer.level,
              status: memoryAnswer.status,
              candidateAnswer: memoryAnswer.candidateAnswer,
              resultId: memoryAnswer.resultId,
            },
          },
          message: 'Continue this level',
        },
        res,
      );
    }

    if (memoryAnswer.isCorrect === 0) {
      const gameResult = await this.gameResultService.getDetailGameResult(
        resultId,
      );

      return this.successResponse(
        {
          data: {
            gameResult: gameResult,
          },
          message: 'End game',
        },
        res,
      );
    }

    await this.gameResultService.updateMemoryGameResult(resultId);

    if (level === 25) {
      await this.gameResultService.updateGameResultStatus(resultId);

      const gameResult = await this.gameResultService.getDetailGameResult(
        resultId,
      );

      return this.successResponse(
        {
          data: {
            gameResult: gameResult,
          },
          message: 'End game',
        },
        res,
      );
    }

    const nextMemoryQuestion =
      await this.memoryAnswerService.createRandomMemoryAnswer(
        resultId,
        level + 1,
      );

    return this.successResponse(
      {
        data: {
          check: true,
          question: nextMemoryQuestion,
        },
        message: 'Complete previous level',
      },
      res,
    );
  }
}
