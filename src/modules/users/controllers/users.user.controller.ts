import { Body, Controller, Res, Patch } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from '@modules/users/services/users.service';
import { BaseController } from '@modules/app/base.controller';
import { UpdateUserPasswordDto } from '../dto/update-user-password.dto';

@Controller('api/v1/user')
export class UsersController extends BaseController {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  @Patch('update-password')
  async updatePassword(
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
    @Res() res: Response,
  ) {
    const password = await this.usersService.updatePassword(
      updateUserPasswordDto,
    );

    if (password.affected) {
      return this.successResponse(
        {
          message: 'Update password success',
        },
        res,
      );
    }
  }
}
