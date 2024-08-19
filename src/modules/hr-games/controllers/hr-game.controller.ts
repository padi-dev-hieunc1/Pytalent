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
    const newHrGame = await this.hrGameService.createHrGames(createHrGameDto);

    return this.successResponse(
      {
        data: {
          newHrGame,
          links: {
            createHrHame: CREATE_HR_GAME,
            getGamesByHr: GET_GAMES_BY_HR_ID,
            allHrGames: GET_ALL_HR_GAMES,
            deleteHrHame: DELETE_HR_GAME,
          },
        },
        message: 'Authorized hr to access game success',
      },
      res,
    );
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
    const listGames = await this.hrGameService.getGamesByHrId(hrId);

    return this.successResponse(
      {
        data: {
          listGames,
          links: {
            createHrHame: CREATE_HR_GAME,
            getGamesByHr: GET_GAMES_BY_HR_ID,
            allHrGames: GET_ALL_HR_GAMES,
            deleteHrHame: DELETE_HR_GAME,
          },
        },
      },
      res,
    );
  }

  @Get('/')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async getAllHrGames(@Res() res: Response) {
    const allHrGames = await this.hrGameService.getAllHrGames();

    return this.successResponse(
      {
        data: {
          allHrGames,
          links: {
            createHrHame: CREATE_HR_GAME,
            getGamesByHr: GET_GAMES_BY_HR_ID,
            allHrGames: GET_ALL_HR_GAMES,
            deleteHrHame: DELETE_HR_GAME,
          },
        },
      },
      res,
    );
  }

  @Delete('/delete/:hrId')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async deleteHrGame(
    @Param('hrId') hrId: number,
    @Body() deleteHrGameDto: DeleteHrGameDto,
    @Res() res: Response,
  ) {
    const deleteHrGame = await this.hrGameService.deleteHrGame(
      hrId,
      deleteHrGameDto,
    );

    if (deleteHrGame.affected) {
      return this.successResponse(
        {
          data: {
            deleted: true,
            links: {
              createHrHame: CREATE_HR_GAME,
              getGamesByHr: GET_GAMES_BY_HR_ID,
              allHrGames: GET_ALL_HR_GAMES,
              deleteHrHame: DELETE_HR_GAME,
            },
          },
          message: 'delete success',
        },
        res,
      );
    }
  }
}
