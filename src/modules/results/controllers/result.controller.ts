import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Redirect,
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
    private memoryAnswerService: MemoryAnswersService,
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
            result: new_game_result,
          },
          message: 'Complete game',
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
    const next_question = await this.gameResultService.continueGame(
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
          message: 'Update failed',
        },
        res,
      );
    }
  }

  // @Post('/submit')
  // @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.CANDIDATE]))
  // async submitGameResult(@Res() res: Response) {
  //   const game_result = await this.gameResultService.submitGameResult();

  //   if (game_result) {
  //     return this.successResponse(
  //       {
  //         data: {
  //           game_result,
  //           links: {},
  //         },
  //         message: 'submit success',
  //       },
  //       res,
  //     );
  //   }
  // }

  // @Get('admin/export')
  // @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  // async exportResult(@Res() res: Response) {
  //   const results = await this.usersService.getAllResults();

  //   if (results) {
  //     return this.successResponse(
  //       {
  //         data: {
  //           assessments_and_candidates: results,
  //           all_games: 'http//localhost:3000/api/v1/games',
  //         },
  //       },
  //       res,
  //     );
  //   }
  // }
}
