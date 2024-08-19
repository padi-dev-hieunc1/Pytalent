import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  Request,
  Get,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import { CreateUserDto } from '@modules/users/dto/create-user.dto';
import { Response } from 'express';
import { UsersService } from '@modules/users/services/users.service';
import { BaseController } from '@modules/app/base.controller';
import { AuthorizationGuard } from '@guards/authorization.guard';
import { RoleEnum } from '@enum/role.enum';
import { CREATE_HR, LIST_HRS, USER_INFO } from '@shared/constant/constants';

@Controller('api/v1/admin')
export class UsersAdminController extends BaseController {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  @Post('create-hr')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async createHr(
    @Request() req,
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ) {
    const newHr = await this.usersService.createHr(createUserDto);

    return this.successResponse(
      {
        data: {
          newHr: {
            email: newHr.email,
            username: newHr.username,
            role: newHr.role,
          },
          links: {
            createHr: CREATE_HR,
            listHrs: LIST_HRS,
            userInfo: USER_INFO,
          },
        },
        message: 'hr created',
      },
      res,
    );
  }

  @Get('list-hrs')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async getListHr(@Res() res: Response) {
    const listHrs = await this.usersService.getListHr();

    return this.successResponse(
      {
        data: {
          listHrs,
          links: {
            createHr: CREATE_HR,
            listHrs: LIST_HRS,
            userInfo: USER_INFO,
          },
        },
      },
      res,
    );
  }

  @Get('user-info/:userId')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async getUserInformationById(
    @Param('userId') userId: number,
    @Res() res: Response,
  ) {
    const userInformation = await this.usersService.getUserInformationById(
      userId,
    );

    return this.successResponse(
      {
        data: {
          userInformation,
          links: {
            createHr: CREATE_HR,
            listHrs: LIST_HRS,
            userInfo: USER_INFO,
          },
        },
      },
      res,
    );
  }
}
