import { Body, Controller, Param, Patch, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import { Response } from 'express';
import { BaseController } from '@modules/app/base.controller';
import { AuthorizationGuard } from '@guards/authorization.guard';
import { RoleEnum } from '@enum/role.enum';
import { LogicalAnswersService } from '../services/logical-answer.service';
import { UpdateLogicalAnswerDto } from '../dto/update-logical-answer.dto';
import { GameResultsService } from '../services/result.service';

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
    // game ended -> can not answer
    await this.gameResultService.validateGameResult(resultId);

    // check logical answer
    const validateLogicalAnswer =
      await this.logicalAnswerService.validateLogicalAnswer(
        resultId,
        questionId,
        updateLogicalAnswerDto,
      );

    await this.gameResultService.updateLogicalGameResult(
      resultId,
      validateLogicalAnswer.checkResult,
    );

    // If do not have next question -> last question
    const nextLogicalQuestion = await this.gameResultService.findNextQuestion(
      resultId,
    );

    if (!nextLogicalQuestion) {
      return this.successResponse(
        {
          message: 'Complete logical game',
        },
        res,
      );
    }

    return this.successResponse(
      {
        data: {
          checkResult: validateLogicalAnswer.checkResult,
          nextQuestion: nextLogicalQuestion,
        },
        message: 'Complete answer logical question',
      },
      res,
    );
  }
}
