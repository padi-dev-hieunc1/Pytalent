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
    const new_hr = await this.usersService.createHr(createUserDto);

    return this.successResponse(
      {
        data: {
          new_hr: {
            email: new_hr.email,
            username: new_hr.username,
            role: new_hr.role,
          },
          links: {
            create_hr: CREATE_HR,
            list_hrs: LIST_HRS,
            user_info: USER_INFO,
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
    const list_hrs = await this.usersService.getListHr();

    if (list_hrs) {
      return this.successResponse(
        {
          data: {
            list_hrs,
            links: {
              create_hr: CREATE_HR,
              list_hrs: LIST_HRS,
              user_info: USER_INFO,
            },
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

  @Get('user-info/:userId')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.ADMIN]))
  async getUserInformationById(
    @Param('userId') userId: number,
    @Res() res: Response,
  ) {
    const user_information = await this.usersService.getUserInformationById(
      userId,
    );

    if (user_information) {
      return this.successResponse(
        {
          data: {
            user_information,
            links: {
              create_hr: CREATE_HR,
              list_hrs: LIST_HRS,
              user_info: USER_INFO,
            },
          },
        },
        res,
      );
    }
  }
}
