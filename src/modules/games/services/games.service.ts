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
    const existed_game: Games = await this.gameRepository.findOne({
      where: {
        category: params.category,
      },
    });

    if (!existed_game) {
      const paramCreate: CreateGameInterface = plainToClass(Games, {
        category: params.category,
        time_limit: params.time_limit,
        total_question_level: params.total_question_level,
      });

      const new_game = await this.gameRepository.save(paramCreate);
      return new_game;
    } else {
      throw new CustomizeException(this.i18n.t('message.GAME_EXISTED'));
    }
  }

  async getAllGames() {
    const list_games: Games[] = await this.gameRepository.findAllGames();

    if (list_games) return list_games;
    else return null;
  }

  async getDetailGame(gameId: number) {
    const game: Games = await this.gameRepository.findOne({
      where: {
        id: gameId,
      },
    });

    if (game) return game;
    else throw new CustomizeException(this.i18n.t('message.GAME_NOT_FOUND'));
  }
}
