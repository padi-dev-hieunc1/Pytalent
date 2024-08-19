import {
  Controller,
  UseGuards,
  Res,
  Get,
  Param,
  Post,
  Body,
} from '@nestjs/common';
import { BaseController } from '@modules/app/base.controller';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import { AuthorizationGuard } from '@guards/authorization.guard';
import { RoleEnum } from '@common/enum/role.enum';
import { Response } from 'express';
import { GamesService } from '../services/games.service';
import { CreateGameDto } from '../dto/create-game.dto';
import {
  CREATE_GAME,
  GET_ALL_GAMES,
  GET_DETAIL_GAME,
} from '@shared/constant/constants';

@Controller('api/v1/games')
export class GamesController extends BaseController {
  constructor(private readonly gamesService: GamesService) {
    super();
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async createGame(@Body() createGameDto: CreateGameDto, @Res() res: Response) {
    const newGame = await this.gamesService.createGame(createGameDto);

    return this.successResponse(
      {
        data: {
          newGame,
          links: {
            createNewGame: CREATE_GAME,
            getAllGames: GET_ALL_GAMES,
            getDetailGame: GET_DETAIL_GAME,
          },
        },
        message: 'Create new game success',
      },
      res,
    );
  }

  @Get('/')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async getAllGames(@Res() res: Response) {
    const listGames = await this.gamesService.getAllGames();

    return this.successResponse(
      {
        data: {
          listGames,
          links: {
            createNewGame: CREATE_GAME,
            getAllGames: GET_ALL_GAMES,
            getDetailGame: GET_DETAIL_GAME,
          },
        },
      },
      res,
    );
  }

  @Get('/:gameId')
  @UseGuards(
    JwtAuthGuard,
    new AuthorizationGuard([RoleEnum.ADMIN, RoleEnum.HR, RoleEnum.CANDIDATE]),
  )
  async getDetailGame(@Param('gameId') gameId: number, @Res() res: Response) {
    const game = await this.gamesService.getDetailGame(gameId);

    return this.successResponse(
      {
        data: {
          game,
          links: {
            createNewGame: CREATE_GAME,
            getAllGames: GET_ALL_GAMES,
            getDetailGame: GET_DETAIL_GAME,
          },
        },
      },
      res,
    );
  }
}
