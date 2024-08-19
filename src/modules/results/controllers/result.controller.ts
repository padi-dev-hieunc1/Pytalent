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
import { AnswerStatusEnum } from '@common/enum/answer-status.enum';
import { ContinueGameResultDto } from '../dto/continue-game-result.dto';
import { LogicalQuestionsService } from '@modules/logical-questions/service/logical-question.service';
import { GameCategoryEnum } from '@common/enum/game-category.enum';
import { GamesService } from '@modules/games/services/games.service';
import { MemoryAnswersService } from '../services/memory-answer.service';

@Controller('api/v1/results')
export class GameResultsController extends BaseController {
  constructor(
    private readonly gameResultService: GameResultsService,
    private logicalAnswerService: LogicalAnswersService,
    private readonly memoryAnswerService: MemoryAnswersService,
    private logicalQuestionService: LogicalQuestionsService,
    private gameService: GamesService,
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

    if (newGameResult?.current_question_level === 1) {
      if (game.category === GameCategoryEnum.LOGICAL) {
        const listRandomLogicalQuestions =
          await this.logicalQuestionService.randomLogicalQuestions();

        for (const randomQuestion of listRandomLogicalQuestions) {
          const initialLogicalAnswer = {
            resultId: newGameResult.id,
            questionId: randomQuestion.id,
            status: AnswerStatusEnum.NOT_DONE,
          };

          await this.logicalAnswerService.createInitialLogicalAnswer(
            initialLogicalAnswer,
          );
        }

        return this.successResponse(
          {
            data: {
              question: listRandomLogicalQuestions[0],
              resultId: newGameResult.id,
            },
            message: 'Start playing game',
          },
          res,
        );
      }

      if (game.category === GameCategoryEnum.MEMORY) {
        const firstRandomMemoryQuestion =
          await this.memoryAnswerService.createMemoryAnswer(
            newGameResult.id,
            1,
          );
        return this.successResponse(
          {
            data: {
              question: firstRandomMemoryQuestion.title,
              timeLimit: firstRandomMemoryQuestion.time_limit,
              resultId: newGameResult.id,
            },
            message: 'Start playing game',
          },
          res,
        );
      }
    } else {
      if (game.category === GameCategoryEnum.LOGICAL) {
        const logicalQuestion =
          await this.gameResultService.continueLogicalGame(createGameResultDto);

        if (logicalQuestion) {
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
        } else {
          return this.successResponse(
            {
              data: {
                gameResult: newGameResult,
              },
              message: 'End game',
            },
            res,
          );
        }
      }

      if (game.category === GameCategoryEnum.MEMORY) {
        const memoryLevel = await this.memoryAnswerService.continueMemoryGame(
          createGameResultDto,
        );

        if (memoryLevel) {
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
        } else {
          return this.successResponse(
            {
              data: {
                gameResult: newGameResult,
              },
              message: 'End game',
            },
            res,
          );
        }
      }
    }
  }

  @Post('/continue')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.CANDIDATE]))
  async continuePlayLogicalGame(
    @Body() continueGameResultDto: ContinueGameResultDto,
    @Res() res: Response,
  ) {
    const game = await this.gameService.getDetailGame(
      continueGameResultDto.gameId,
    );

    if (game.category === GameCategoryEnum.LOGICAL) {
      const next_question = await this.gameResultService.continueLogicalGame(
        continueGameResultDto,
      );

      if (next_question) {
        return this.successResponse(
          {
            data: {
              question: next_question,
            },
            message: 'Continue playing game',
          },
          res,
        );
      } else {
        return this.errorsResponse(
          {
            message: 'Can not continue this game',
          },
          res,
        );
      }
    } else {
      const next_level = await this.memoryAnswerService.continueMemoryGame(
        continueGameResultDto,
      );

      if (next_level) {
        return this.successResponse(
          {
            data: {
              question: next_level,
            },
            message: 'Continue playing game',
          },
          res,
        );
      } else {
        return this.errorsResponse(
          {
            message: 'Can not continue this game',
          },
          res,
        );
      }
    }
  }

  @Get('/export')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async exportResults(@Res() res: Response) {
    const results = await this.gameResultService.getAllResults();

    if (results) {
      return this.successResponse(
        {
          data: {
            all_results: results,
          },
        },
        res,
      );
    }
  }

  @Patch('/complete/:resultId')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.CANDIDATE]))
  async completeGame(
    @Param('resultId') resultId: number,
    @Res() res: Response,
  ) {
    const result = await this.gameResultService.completeGame(resultId);

    if (result) {
      return this.successResponse(
        {
          data: {
            game_result: result,
          },
        },
        res,
      );
    }
  }
}
