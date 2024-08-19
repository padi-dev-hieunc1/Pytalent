import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersRepository } from '@modules/users/repositories/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '@entities/index';
import { UsersAdminController } from '@modules/users/controllers/users.admin.controller';
import { UsersController } from './controllers/users.user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity])],
  controllers: [UsersAdminController, UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
