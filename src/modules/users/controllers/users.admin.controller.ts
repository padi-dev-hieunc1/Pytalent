import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  Request,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import { CreateUserDto } from '@modules/users/dto/create-user.dto';
import { Response } from 'express';
import { UsersService } from '@modules/users/services/users.service';
import { HrGamesService } from '@modules/users/services/hr-game.service';
import { BaseController } from '@modules/app/base.controller';
import { AuthorizationGuard } from '@guards/authorization.guard';
import { RoleEnum } from '@enum/role.enum';
import { CreateHrGameDto } from '../dto/create-hr-game.dto';
import { UpdateUserPasswordDto } from '../dto/update-user-password';

@Controller('api/v1')
export class UsersAdminController extends BaseController {
  constructor(
    private readonly usersService: UsersService,
    private readonly hrGameService: HrGamesService,
  ) {
    super();
  }

  @Post('admin/create')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async createHr(
    @Request() req,
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ) {
    const newHr = await this.usersService.createUser(createUserDto);
    newHr.created_at = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);

    return this.successResponse(
      {
        data: {
          newHr,
          links: {
            authorize_hr_game:
              'http//localhost:3000/api/v1/admin/hr-games/create',
          },
        },
        message: 'hr created',
      },
      res,
    );
  }

  @Post('admin/hr-games/create')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async createHrGames(
    @Request() req,
    @Body() createHrGameDto: CreateHrGameDto,
    @Res() res: Response,
  ) {
    const newHrGame = await this.hrGameService.createHrGames(createHrGameDto);

    if (newHrGame) {
      return this.successResponse(
        {
          data: {
            newHrGame,
            links: {
              hr_category_game: `http//localhost:3000/api/v1/admin/hr-games/${newHrGame.hrId}`,
            },
          },
          message: 'Authorized hr success',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'Can not authorize hr',
        },
        res,
      );
    }
  }

  @Get('admin/hr-games/:hrId')
  @UseGuards(
    JwtAuthGuard,
    new AuthorizationGuard([RoleEnum.ADMIN, RoleEnum.HR]),
  )
  async getCategoryGamesOfHr(
    @Param('hrId') hrId: number,
    @Res() res: Response,
  ) {
    const listCategoryGames: string[] =
      await this.hrGameService.getCategoryGamesOfHr(hrId);

    if (listCategoryGames) {
      return this.successResponse(
        {
          data: {
            hrId: hrId,
            categories: listCategoryGames,
          },
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'Can not find hr',
        },
        res,
      );
    }
  }

  @Get('admin/user')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async getUserInformationByEmail(@Body() email: string, @Res() res: Response) {
    const user_information = await this.usersService.getUserInformationByEmail(
      email,
    );

    if (user_information) {
      return this.successResponse(
        {
          data: user_information,
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'Can not find user',
        },
        res,
      );
    }
  }

  @Get('admin/hrs')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async getListHr(@Res() res: Response) {
    const listHrs = await this.usersService.getListHr();

    const listHrLinks: object[] = [];

    for (const hr of listHrs) {
      listHrLinks.push({
        [hr.username]: `http//localhost:3000/api/v1/admin/hr-games/${hr.id}`,
      });
    }

    if (listHrs) {
      return this.successResponse(
        {
          data: {
            listHrs,
            links: listHrLinks,
          },
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'Can not find any hrs',
        },
        res,
      );
    }
  }

  @Get('admin/export')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async exportResult(@Res() res: Response) {
    const results = await this.usersService.getAllResults();

    if (results) {
      return this.successResponse(
        {
          data: {
            assessments_and_candidates: results,
            all_games: 'http//localhost:3000/api/v1/games',
          },
        },
        res,
      );
    }
  }

  @Patch('user/update')
  async updatePassword(
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
    @Res() res: Response,
  ) {
    const password = await this.usersService.updatePassword(
      updateUserPasswordDto,
    );

    if (password) {
      return this.successResponse(
        {
          message: 'Update password success',
        },
        res,
      );
    } else {
      return this.errorsResponse({}, res);
    }
  }
}
