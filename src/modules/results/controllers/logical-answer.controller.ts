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
    const logical_answer =
      await this.logicalAnswerService.answerLogicalQuestion(
        resultId,
        questionId,
        updateLogicalAnswerDto,
      );

    if (logical_answer) {
      let check_answer = 0;
      let check_result = true;

      if (
        logical_answer.is_correct === 1 &&
        logical_answer.status === AnswerStatusEnum.DONE
      ) {
        check_answer = 1;
        check_result = true;
      }

      if (
        logical_answer.is_correct === 0 &&
        logical_answer.status === AnswerStatusEnum.DONE
      ) {
        check_answer = 2;
        check_result = false;
      }

      if (logical_answer.status === AnswerStatusEnum.SKIP) {
        check_answer = 3;
        check_result = false;
      }
      console.log('check_answer::', check_answer);

      const game_result = await this.gameResultService.updateGameResult(
        resultId,
        check_answer,
      );

      console.log('check current::', game_result.current_question_level);

      const next_question = await this.gameResultService.findNextQuestion(
        resultId,
      );

      if (
        game_result.complete_time <= 300 &&
        game_result.status === GameResultStatusEnum.NOT_COMPLETED &&
        next_question
      ) {
        return this.successResponse(
          {
            data: {
              check_result: check_result,
              next_question: next_question,
            },
            message: 'Complete answer question',
          },
          res,
        );
      } else {
        const game_result = await this.gameResultService.getDetailGameResult(
          resultId,
        );

        return this.successResponse(
          {
            data: {
              game_result: game_result,
            },
            message: 'Complete game',
          },
          res,
        );
      }
    } else {
      const game_result = await this.gameResultService.getDetailGameResult(
        resultId,
      );

      return this.successResponse(
        {
          data: {
            game_result: game_result,
          },
          message: 'Complete game',
        },
        res,
      );
    }
  }
}
