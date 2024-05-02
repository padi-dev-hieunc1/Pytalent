import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  Get,
  Param,
  Request,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import { Response } from 'express';
import { HrGamesService } from '@modules/hr-games/services/hr-game.service';
import { BaseController } from '@modules/app/base.controller';
import { AuthorizationGuard } from '@guards/authorization.guard';
import { RoleEnum } from '@enum/role.enum';
import { CreateHrGameDto } from '@modules/hr-games/dto/create-hr-game.dto';
import {
  CREATE_HR_GAME,
  DELETE_HR_GAME,
  GET_ALL_HR_GAMES,
  GET_GAMES_BY_HR_ID,
} from '@shared/constant/constants';
import { DeleteHrGameDto } from '../dto/delete-hr-game.dto';

@Controller('api/v1/hr-games')
export class HrGamesController extends BaseController {
  constructor(private readonly hrGameService: HrGamesService) {
    super();
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async createHrGames(
    @Body() createHrGameDto: CreateHrGameDto,
    @Res() res: Response,
  ) {
    const new_hr_game = await this.hrGameService.createHrGames(createHrGameDto);

    if (new_hr_game) {
      return this.successResponse(
        {
          data: {
            new_hr_game,
            links: {
              create_hr_game: CREATE_HR_GAME,
              get_games_by_hr: GET_GAMES_BY_HR_ID,
              all_hr_games: GET_ALL_HR_GAMES,
              delete_hr_game: DELETE_HR_GAME,
            },
          },
          message: 'Authorized hr to access game success',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'Can not authorize hr to access game',
        },
        res,
      );
    }
  }

  @Get('/:hrId')
  @UseGuards(
    JwtAuthGuard,
    new AuthorizationGuard([RoleEnum.ADMIN, RoleEnum.HR]),
  )
  async getGamesByHrId(
    @Request() req: Request,
    @Param('hrId') hrId: number,
    @Res() res: Response,
  ) {
    const all_games = await this.hrGameService.getGamesByHrId(hrId);

    if (all_games.length > 0) {
      return this.successResponse(
        {
          data: {
            all_games,
            links: {
              create_hr_game: CREATE_HR_GAME,
              get_games_by_hr: GET_GAMES_BY_HR_ID,
              all_hr_games: GET_ALL_HR_GAMES,
              delete_hr_game: DELETE_HR_GAME,
            },
          },
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message:
            'This hr have not been authorized to access to any games before',
        },
        res,
      );
    }
  }

  @Get('/')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async getAllHrGames(@Res() res: Response) {
    const all_hr_games = await this.hrGameService.getAllHrGames();

    if (all_hr_games) {
      return this.successResponse(
        {
          data: {
            all_hr_games,
            links: {
              create_hr_game: CREATE_HR_GAME,
              get_games_by_hr: GET_GAMES_BY_HR_ID,
              all_hr_games: GET_ALL_HR_GAMES,
              delete_hr_game: DELETE_HR_GAME,
            },
          },
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'There are not any games authorized to any hr',
        },
        res,
      );
    }
  }

  @Delete('/delete/:hrId')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async deleteHrGame(
    @Param('hrId') hrId: number,
    @Body() deleteHrGameDto: DeleteHrGameDto,
    @Res() res: Response,
  ) {
    const delete_hr_game = await this.hrGameService.deleteHrGame(
      hrId,
      deleteHrGameDto,
    );

    if (delete_hr_game.affected) {
      return this.successResponse(
        {
          data: {
            links: {
              create_hr_game: CREATE_HR_GAME,
              get_games_by_hr: GET_GAMES_BY_HR_ID,
              all_hr_games: GET_ALL_HR_GAMES,
              delete_hr_game: DELETE_HR_GAME,
            },
          },
          message: 'delete success',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'delete failed',
        },
        res,
      );
    }
  }
}
