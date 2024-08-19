import { Body, Controller, Param, Patch, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import { Response } from 'express';
import { BaseController } from '@modules/app/base.controller';
import { AuthorizationGuard } from '@guards/authorization.guard';
import { RoleEnum } from '@enum/role.enum';
import { LogicalAnswersService } from '../services/logical-answer.service';
import { UpdateLogicalAnswerDto } from '../dto/update-logical-answer.dto';
import { GameResultsService } from '../services/result.service';
import { GameResultStatusEnum } from '@common/enum/game-result-status.enum';
import { AnswerStatusEnum } from '@common/enum/answer-status.enum';
import { LogicalAnswers } from '@entities/logical-answers.entity';

@Controller('api/v1/logical')
export class LogicalAnswersController extends BaseController {
  constructor(
    private readonly logicalAnswerService: LogicalAnswersService,
    private gameResultService: GameResultsService,
  ) {
    super();
  }

  @Patch('/:resultId/answer/:questionId')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.CANDIDATE]))
  async answerLogicalQuestion(
    @Param('resultId') resultId: number,
    @Param('questionId') questionId: number,
    @Body() updateLogicalAnswerDto: UpdateLogicalAnswerDto,
    @Res() res: Response,
  ) {
    const logicalAnswer = await this.logicalAnswerService.answerLogicalQuestion(
      resultId,
      questionId,
      updateLogicalAnswerDto,
    );

    if (!logicalAnswer) {
      const gameResult = await this.gameResultService.getDetailGameResult(
        resultId,
      );

      return this.successResponse(
        {
          data: {
            gameResult: gameResult,
          },
          message: 'Complete game',
        },
        res,
      );
    }

    const { checkAnswer, checkResult } =
      this.evaluateLogicalAnswer(logicalAnswer);

    const gameResultUpdate = await this.gameResultService.updateGameResult(
      resultId,
      checkAnswer,
    );

    const nextQuestion = await this.gameResultService.findNextQuestion(
      resultId,
    );

    if (
      gameResultUpdate.complete_time <= 90 &&
      gameResultUpdate.status === GameResultStatusEnum.NOT_COMPLETED &&
      nextQuestion
    ) {
      return this.successResponse(
        {
          data: {
            checkResult: checkResult,
            nextQuestion: nextQuestion,
          },
          message: 'Complete answer question',
        },
        res,
      );
    }

    const gameResultDetail = await this.gameResultService.getDetailGameResult(
      resultId,
    );

    return this.successResponse(
      {
        data: {
          gameResult: gameResultDetail,
        },
        message: 'Complete game',
      },
      res,
    );
  }

  private evaluateLogicalAnswer(logicalAnswer: LogicalAnswers) {
    if (logicalAnswer.status === AnswerStatusEnum.SKIP) {
      return { checkAnswer: 3, checkResult: false };
    }

    const checkAnswer: number = logicalAnswer.isCorrect === 1 ? 1 : 2;
    const checkResult: boolean = checkAnswer === 1 ? true : false;

    return { checkAnswer, checkResult };
  }
}
