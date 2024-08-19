import { Injectable } from '@nestjs/common';
import { GamesRepository } from '../repositories/games.repository';
import { plainToClass } from 'class-transformer';

import { CustomizeException } from '@exception/customize.exception';
import { I18nService } from 'nestjs-i18n';
import { CreateGameInterface } from '@shared/interfaces/game.interface';
import { Games } from '@entities/games.entity';

@Injectable()
export class GamesService {
  constructor(
    private gameRepository: GamesRepository,
    private readonly i18n: I18nService,
  ) {}

  async createGame(params: CreateGameInterface) {
    const existedGame: Games = await this.gameRepository.findOne({
      where: {
        category: params.category,
      },
    });

    if (existedGame) {
      throw new CustomizeException(this.i18n.t('message.GAME_EXISTED'));
    }

    const paramCreate: CreateGameInterface = plainToClass(Games, {
      category: params.category,
      timeLimit: params.timeLimit,
      totalQuestionLevel: params.totalQuestionLevel,
    });

    const newGame = await this.gameRepository.save(paramCreate);

    return newGame;
  }

  async getAllGames() {
    const listGames: Games[] = await this.gameRepository.findAllGames();

    if (!listGames) throw new CustomizeException('No games have been created');

    return listGames;
  }

  async getDetailGame(gameId: number) {
    const game: Games = await this.gameRepository.findOne({
      where: {
        id: gameId,
      },
    });

    if (!game)
      throw new CustomizeException(this.i18n.t('message.GAME_NOT_FOUND'));

    return game;
  }
}
