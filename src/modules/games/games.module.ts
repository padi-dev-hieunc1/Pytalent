import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesService } from './services/games.service';
import { GamesEntity } from '@entities';
import { GamesController } from './controllers/games.controller';
import { GamesRepository } from './repositories/games.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GamesEntity])],
  controllers: [GamesController],
  providers: [GamesService, GamesRepository],
  exports: [GamesService, GamesRepository],
})
export class GamesModule {}
