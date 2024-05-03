import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
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
import { CONTINUE_GAME } from '@shared/constant/constants';

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
    const [game, new_game_result] = await Promise.all([
      this.gameService.getDetailGame(createGameResultDto.gameId),
      this.gameResultService.createGameResults(createGameResultDto),
    ]);

    if (new_game_result?.current_question_level === 1) {
      if (game.category === GameCategoryEnum.LOGICAL) {
        const list_random_logical_questions =
          await this.logicalQuestionService.randomLogicalQuestions();

        for (const random_question of list_random_logical_questions) {
          const initial_logical_answer = {
            resultId: new_game_result.id,
            questionId: random_question.id,
            status: AnswerStatusEnum.NOT_DONE,
          };

          await this.logicalAnswerService.createInitialLogicalAnswer(
            initial_logical_answer,
          );
        }

        return this.successResponse(
          {
            data: {
              question: list_random_logical_questions[0],
              resultId: new_game_result.id,
            },
            message: 'Start playing game',
          },
          res,
        );
      }

      if (game.category === GameCategoryEnum.MEMORY) {
        const first_random_memory_question =
          await this.memoryAnswerService.createMemoryAnswer(
            new_game_result.id,
            1,
          );
        return this.successResponse(
          {
            data: {
              question: first_random_memory_question.title,
              time_limit: first_random_memory_question.level,
              resultId: new_game_result.id,
            },
            message: 'Start playing game',
          },
          res,
        );
      }
    } else {
      return this.successResponse(
        {
          data: {
            continue: new_game_result,
            links: {
              continue_game: CONTINUE_GAME,
            },
          },
          message: 'Continue game',
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

      console.log('check next level::', next_level);

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
}
