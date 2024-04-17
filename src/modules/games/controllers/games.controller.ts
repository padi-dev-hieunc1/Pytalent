import {
  Controller,
  UseGuards,
  Res,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Put,
} from '@nestjs/common';
import { BaseController } from '@modules/app/base.controller';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import { AuthorizationGuard } from '@guards/authorization.guard';
import { RoleEnum } from '@common/enum/role.enum';
import { Response } from 'express';
import { GamesService } from '../services/games.service';
import { LogicalQuestions } from '@entities/logical-questions.entity';
import { CreateGameDto } from '../dto/create-game.dto';
import { UpdateAnswerGameDto } from '../dto/update-answer-game.dto';

@Controller('api/v1/games')
export class GamesController extends BaseController {
  constructor(private readonly gamesService: GamesService) {
    super();
  }

  @Get('/logical/questions')
  @UseGuards(
    JwtAuthGuard,
    new AuthorizationGuard([RoleEnum.HR, RoleEnum.CANDIDATE]),
  )
  async getRandomLogicalQuestions(@Res() res: Response) {
    const logical_questions = await this.gamesService.randomLogicalQuestions();

    const len = logical_questions.length;

    if (logical_questions) {
      return this.successResponse(
        {
          data: {
            logical_questions,
            length: len,
          },
          message: 'success',
        },
        res,
      );
    } else {
      return this.errorsResponse({}, res);
    }
  }

  @Post('/logical/create')
  @UseGuards(
    JwtAuthGuard,
    new AuthorizationGuard([RoleEnum.HR, RoleEnum.CANDIDATE]),
  )
  async createNewLogicalGame(
    @Body() createLogicalGameDto: CreateGameDto,
    @Res() res: Response,
  ) {
    const newLogicalGame = await this.gamesService.createNewLogicalGame(
      createLogicalGameDto,
    );

    const listLogicalQuestions = newLogicalGame.questions
      .split(',')
      .map(Number);

    const listDetailLogicalQuestions: LogicalQuestions[] = [];
    for (const questionId of listLogicalQuestions) {
      const logicalQuestion = await this.gamesService.getDetailLogicalQuestion(
        questionId,
      );
      listDetailLogicalQuestions.push(logicalQuestion);
    }

    const logicalQuestionLinks: string[] = [];
    listDetailLogicalQuestions.map((question) =>
      logicalQuestionLinks.push(
        `http://localhost:3000/api/v1/games/logical/detail/${question.id}`,
      ),
    );

    for (const logicalQuestion of listLogicalQuestions) {
      const answer = {
        gameId: newLogicalGame.id,
        questionId: logicalQuestion,
      };

      this.gamesService.createInitialAnswer(answer);
    }

    if (newLogicalGame) {
      return this.successResponse(
        {
          data: {
            game: newLogicalGame,
            links: logicalQuestionLinks,
          },
          message: 'success',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'Not exist this assessment',
        },
        res,
      );
    }
  }

  @Get('/logical/detail/:questionId')
  @UseGuards(
    JwtAuthGuard,
    new AuthorizationGuard([RoleEnum.HR, RoleEnum.CANDIDATE]),
  )
  async getDetailLogicalQuestion(
    @Param('questionId') questionId: number,
    @Res() res: Response,
  ) {
    const detailLogicalQuestion =
      await this.gamesService.getDetailLogicalQuestion(questionId);

    if (detailLogicalQuestion) {
      return this.successResponse(
        {
          data: detailLogicalQuestion,
          message: 'success',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'Not exist this logical question',
        },
        res,
      );
    }
  }

  @Patch('/logical/answer')
  async updateLogicalAnswer(
    @Body() answer: UpdateAnswerGameDto,
    @Res() res: Response,
  ) {
    const logical_answer = await this.gamesService.updateLogicalAnswer(answer);

    if (logical_answer.affected > 0) {
      return this.successResponse(
        {
          data: logical_answer,
          message: 'answer success',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'Can not create',
        },
        res,
      );
    }
  }

  @Post('/memory/create')
  @UseGuards(
    JwtAuthGuard,
    new AuthorizationGuard([RoleEnum.HR, RoleEnum.CANDIDATE]),
  )
  async createNewMemoryGame(
    @Body() createMemoryGameDto: CreateGameDto,
    @Res() res: Response,
  ) {
    const newMemoryGame = await this.gamesService.createNewMemoryGame(
      createMemoryGameDto,
    );

    newMemoryGame.created_at = new Date(
      new Date().getTime() + 7 * 60 * 60 * 1000,
    );

    newMemoryGame.updated_at = new Date(
      new Date().getTime() + 7 * 60 * 60 * 1000,
    );

    if (newMemoryGame) {
      return this.successResponse(
        {
          data: {
            game: newMemoryGame,
          },
          message: 'success',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'Not exist this assessment',
        },
        res,
      );
    }
  }

  @Get('/memory/random/:level')
  @UseGuards(
    JwtAuthGuard,
    new AuthorizationGuard([RoleEnum.HR, RoleEnum.CANDIDATE]),
  )
  async getRandomDetailMemoryQuestion(
    @Param('level') level: number,
    @Res() res: Response,
  ) {
    const randomMemoryQuestion =
      await this.gamesService.getRandomDetailMemoryQuestion(level);

    if (randomMemoryQuestion) {
      return this.successResponse(
        {
          data: randomMemoryQuestion,
          message: 'success',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'Not exist this memory level',
        },
        res,
      );
    }
  }

  @Get('/memory/:questionId')
  @UseGuards(
    JwtAuthGuard,
    new AuthorizationGuard([RoleEnum.HR, RoleEnum.CANDIDATE]),
  )
  async getDetailMemoryQuestion(
    @Param('questionId') questionId: number,
    @Res() res: Response,
  ) {
    const detailMemoryQuestion =
      await this.gamesService.getDetailMemoryQuestion(questionId);

    if (detailMemoryQuestion) {
      return this.successResponse(
        {
          data: detailMemoryQuestion,
          message: 'success',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'Not exist this memory question',
        },
        res,
      );
    }
  }

  @Patch('memory/check')
  async checkMemoryResults(
    @Body() updateAnswerGameDto: UpdateAnswerGameDto,
    @Res() res: Response,
  ) {
    const answer = {
      gameId: updateAnswerGameDto.gameId,
      questionId: updateAnswerGameDto.questionId,
    };

    const existed_answer = await this.gamesService.checkExistAnswer(answer);

    if (!existed_answer) await this.gamesService.createInitialAnswer(answer);

    const memoryQuestion = await this.gamesService.getDetailMemoryQuestion(
      updateAnswerGameDto.questionId,
    );

    let memory_answer = await this.gamesService.updateMemoryAnswer(
      updateAnswerGameDto,
    );

    const numberArrowOfTitle = memoryQuestion.level;
    const numberArrowOfCandidateAnswer =
      updateAnswerGameDto.candidate_answer.split(' ').length;

    if (numberArrowOfCandidateAnswer <= numberArrowOfTitle) {
      memory_answer = await this.gamesService.updateMemoryAnswer(
        updateAnswerGameDto,
      );
    }
    // console.log('check type memory_answer:::', typeof memory_answer);

    if (memory_answer && typeof memory_answer !== 'number') {
      return this.successResponse(
        {
          data: memory_answer,
          message: 'check success',
        },
        res,
      );
    } else if (typeof memory_answer === 'number') {
      return this.successResponse(
        {
          data: {
            total_point: memory_answer,
          },
          message: 'End game',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'Can not check this memory question',
        },
        res,
      );
    }
  }

  @Get('/:assessmentId')
  @UseGuards(
    JwtAuthGuard,
    new AuthorizationGuard([RoleEnum.HR, RoleEnum.CANDIDATE]),
  )
  async getAllCategoryGamesInAssessment(
    @Param('assessmentId') assessmentId: number,
    @Res() res: Response,
  ) {
    const gameCategories =
      await this.gamesService.getAllCategoryGamesInAssessment(assessmentId);

    if (gameCategories) {
      return this.successResponse(
        {
          data: {
            gameCategories,
          },
          message: 'success',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'Not exist this assessment',
        },
        res,
      );
    }
  }

  @Get('/result/:gameId')
  async completeGame(@Param('gameId') gameId: number, @Res() res: Response) {
    const result = await this.gamesService.completeGame(gameId);

    if (result) {
      return this.successResponse(
        {
          data: {
            result: result.complete_question,
            time: result.complete_time,
            total_question: result.max_score_level,
          },
          message: 'success',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'error',
        },
        res,
      );
    }
  }

  @Get('detail/:gameId')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.HR]))
  async getDetailGame(@Param('gameId') gameId: number, @Res() res: Response) {
    const detail_game = await this.gamesService.getDetailGame(gameId);

    if (detail_game) {
      return this.successResponse(
        {
          data: detail_game,
          message: 'success',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'Not exist this game',
        },
        res,
      );
    }
  }

  @Get('')
  @UseGuards(
    JwtAuthGuard,
    new AuthorizationGuard([RoleEnum.ADMIN, RoleEnum.HR]),
  )
  async exportAllGames(@Res() res: Response) {
    const all_games = await this.gamesService.exportAllGames();

    if (all_games) {
      return this.successResponse(
        {
          data: all_games,
          message: 'success',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'System do not have any games result',
        },
        res,
      );
    }
  }
}
