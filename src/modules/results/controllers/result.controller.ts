import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import { Response } from 'express';
import { BaseController } from '@modules/app/base.controller';
import { AuthorizationGuard } from '@guards/authorization.guard';
import { RoleEnum } from '@enum/role.enum';
import { CreateGameResultDto } from '../dto/create-game-result.dto';
import { GameResultsService } from '../services/result.service';
import { LogicalAnswersService } from '../services/logical-answer.service';
import { ContinueGameResultDto } from '../dto/continue-game-result.dto';
import { LogicalQuestionsService } from '@modules/logical-questions/service/logical-question.service';
import { GameCategoryEnum } from '@common/enum/game-category.enum';
import { GamesService } from '@modules/games/services/games.service';
import { MemoryAnswersService } from '../services/memory-answer.service';

@Controller('api/v1/results')
export class GameResultsController extends BaseController {
  constructor(
    private readonly gameResultService: GameResultsService,
    private readonly memoryAnswerService: MemoryAnswersService,
    private readonly logicalQuestionService: LogicalQuestionsService,
    private readonly gameService: GamesService,
  ) {
    super();
  }

  @Post('create')
  @UseGuards(
    JwtAuthGuard,
    new AuthorizationGuard([RoleEnum.HR, RoleEnum.CANDIDATE]),
  )
  // start playing game
  async createGameResult(
    @Body() createGameResultDto: CreateGameResultDto,
    @Res() res: Response,
  ) {
    const [game, newGameResult] = await Promise.all([
      this.gameService.getDetailGame(createGameResultDto.gameId),
      this.gameResultService.createGameResults(createGameResultDto),
    ]);

    if (
      game.category === GameCategoryEnum.LOGICAL &&
      newGameResult?.currentQuestionLevel === 1
    ) {
      const listRandomLogicalQuestions =
        await this.logicalQuestionService.randomLogicalQuestions();

      await this.gameResultService.saveLogicalAnswers(
        newGameResult,
        listRandomLogicalQuestions,
      );

      return this.successResponse(
        {
          data: {
            question: listRandomLogicalQuestions[0],
            resultId: newGameResult.id,
          },
          message: 'Start playing logical game',
        },
        res,
      );
    }

    if (
      game.category === GameCategoryEnum.MEMORY &&
      newGameResult?.currentQuestionLevel === 1
    ) {
      const randomMemoryQuestion =
        await this.memoryAnswerService.createRandomMemoryAnswer(
          newGameResult.id,
          1,
        );

      return this.successResponse(
        {
          data: {
            question: randomMemoryQuestion.title,
            timeLimit: randomMemoryQuestion.timeLimit,
            resultId: newGameResult.id,
          },
          message: 'Start playing memory game',
        },
        res,
      );
    }
  }

  @Post('/continue')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.CANDIDATE]))
  async continuePlayLogicalGame(
    @Body() continueGameResultDto: ContinueGameResultDto,
    @Res() res: Response,
  ) {
    const [game, newGameResult] = await Promise.all([
      this.gameService.getDetailGame(continueGameResultDto.gameId),
      this.gameResultService.createGameResults(continueGameResultDto),
    ]);

    if (
      game.category === GameCategoryEnum.LOGICAL &&
      newGameResult?.currentQuestionLevel !== 1
    ) {
      const logicalQuestion = await this.gameResultService.continueLogicalGame(
        continueGameResultDto,
      );

      return this.successResponse(
        {
          data: {
            continue: newGameResult,
            question: logicalQuestion,
          },
          message: 'Continue logical game',
        },
        res,
      );
    }

    if (
      game.category === GameCategoryEnum.MEMORY &&
      newGameResult?.currentQuestionLevel !== 1
    ) {
      const memoryLevel = await this.memoryAnswerService.continueMemoryGame(
        continueGameResultDto,
      );

      return this.successResponse(
        {
          data: {
            continue: newGameResult,
            question: memoryLevel,
          },
          message: 'Continue memory game',
        },
        res,
      );
    }
  }

  @Get('/export')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async exportResults(@Res() res: Response) {
    const results = await this.gameResultService.getAllResults();

    return this.successResponse(
      {
        data: {
          allResults: results,
        },
      },
      res,
    );
  }

  @Patch('/complete/:resultId')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.CANDIDATE]))
  async completeGame(
    @Param('resultId') resultId: number,
    @Res() res: Response,
  ) {
    const result = await this.gameResultService.completeGame(resultId);

    return this.successResponse(
      {
        data: {
          gameResult: result,
        },
      },
      res,
    );
  }
}
