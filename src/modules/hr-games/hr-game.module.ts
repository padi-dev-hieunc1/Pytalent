import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrGamesEntity, UsersEntity } from '@entities';
import { HrGamesController } from './controllers/hr-game.controller';
import { HrGamesService } from './services/hr-game.service';
import { HrGamesRepository } from './repositories/hr-game.repository';
import { UsersRepository } from '@modules/users/repositories/user.repository';
import { GamesRepository } from '@modules/games/repositories/games.repository';

@Module({
  imports: [TypeOrmModule.forFeature([HrGamesEntity, UsersEntity])],
  controllers: [HrGamesController],
  providers: [
    HrGamesService,
    HrGamesRepository,
    UsersRepository,
    GamesRepository,
  ],
  exports: [
    HrGamesService,
    HrGamesRepository,
    UsersRepository,
    GamesRepository,
  ],
})
export class HrGamesModule {}
