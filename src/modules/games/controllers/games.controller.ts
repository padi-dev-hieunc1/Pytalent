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
    const new_game = await this.gamesService.createGame(createGameDto);

    if (new_game) {
      return this.successResponse(
        {
          data: {
            new_game,
            links: {
              create_new_game: CREATE_GAME,
              get_all_games: GET_ALL_GAMES,
              get_detail_game: GET_DETAIL_GAME,
            },
          },
          message: 'Create new game success',
        },
        res,
      );
    }
  }

  @Get('/')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async getAllGames(@Res() res: Response) {
    const list_games = await this.gamesService.getAllGames();

    if (list_games) {
      return this.successResponse(
        {
          data: {
            list_games,
            links: {
              create_new_game: CREATE_GAME,
              get_all_games: GET_ALL_GAMES,
              get_detail_game: GET_DETAIL_GAME,
            },
          },
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'No games have been created',
        },
        res,
      );
    }
  }

  @Get('/:gameId')
  @UseGuards(
    JwtAuthGuard,
    new AuthorizationGuard([RoleEnum.ADMIN, RoleEnum.HR, RoleEnum.CANDIDATE]),
  )
  async getDetailGame(@Param('gameId') gameId: number, @Res() res: Response) {
    const game = await this.gamesService.getDetailGame(gameId);

    if (game) {
      return this.successResponse(
        {
          data: {
            game,
            links: {
              create_new_game: CREATE_GAME,
              get_all_games: GET_ALL_GAMES,
              get_detail_game: GET_DETAIL_GAME,
            },
          },
        },
        res,
      );
    }
  }
}
