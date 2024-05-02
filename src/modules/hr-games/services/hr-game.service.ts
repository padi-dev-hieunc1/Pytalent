import { HttpStatus, Injectable } from '@nestjs/common';
import { Users } from '@entities/users.entity';
import { plainToClass } from 'class-transformer';
import { HrGamesRepository } from '../repositories/hr-game.repository';
import { UsersRepository } from '../../users/repositories/user.repository';
import {
  CreateHrGameInterface,
  DeleteHrGameInterface,
} from '@shared/interfaces/hr-game.interface';
import { HrGames } from '@entities/hr-games.entity';
import { RoleEnum } from '@common/enum/role.enum';
import { I18nService } from 'nestjs-i18n';
import { CustomizeException } from '@exception/customize.exception';
import { GamesRepository } from '@modules/games/repositories/games.repository';
import { Games } from '@entities/games.entity';

@Injectable()
export class HrGamesService {
  constructor(
    private hrGamesRepository: HrGamesRepository,
    private usersRepository: UsersRepository,
    private gamesRepository: GamesRepository,
    private readonly i18n: I18nService,
  ) {}

  async checkExistedHr(hrId: number) {
    const hr: Users = await this.usersRepository.findOne({
      where: {
        id: hrId,
        role: RoleEnum.HR,
      },
    });

    if (hr) return true;
    else return false;
  }

  async checkExistedGame(gameId: number) {
    const game: Games = await this.gamesRepository.findOne({
      where: {
        id: gameId,
      },
    });

    if (game) return true;
    else return false;
  }

  async createHrGames(params: CreateHrGameInterface) {
    const existedHr = await this.checkExistedHr(params.hrId);
    const existedGame = await this.checkExistedGame(params.gameId);

    if (!existedHr)
      throw new CustomizeException(this.i18n.t('message.HR_NOT_FOUND'));

    if (!existedGame)
      throw new CustomizeException(this.i18n.t('message.GAME_NOT_FOUND'));

    if (existedHr && existedGame) {
      const existedHrGame: HrGames = await this.hrGamesRepository.findOne({
        where: {
          hrId: params.hrId,
          gameId: params.gameId,
        },
      });

      if (existedHrGame) {
        throw new CustomizeException(this.i18n.t('message.HR_GAME_EXISTED'));
      } else {
        const paramCreate: CreateHrGameInterface = plainToClass(HrGames, {
          hrId: params.hrId,
          gameId: params.gameId,
        });

        const hrGame = await this.hrGamesRepository.save(paramCreate);

        return hrGame;
      }
    }
  }

  async getGamesByHrId(hrId: number) {
    const existedHr = await this.checkExistedHr(hrId);

    if (existedHr) {
      const list_games: HrGames[] =
        await this.hrGamesRepository.findAllGamesByHrId(hrId);

      return list_games;
    } else {
      throw new CustomizeException(this.i18n.t('message.HR_NOT_FOUND'));
    }
  }

  async getAllHrGames() {
    const all_hr_games: HrGames[] =
      await this.hrGamesRepository.findAllHrGames();

    if (all_hr_games) return all_hr_games;
    else return null;
  }

  async deleteHrGame(hrId: number, params: DeleteHrGameInterface) {
    const existedHr = await this.checkExistedHr(hrId);
    const existedGame = await this.checkExistedGame(params.gameId);

    if (!existedHr)
      throw new CustomizeException(this.i18n.t('message.HR_NOT_FOUND'));

    if (!existedGame)
      throw new CustomizeException(this.i18n.t('message.GAME_NOT_FOUND'));

    if (existedHr && existedGame) {
      return await this.hrGamesRepository
        .createQueryBuilder()
        .delete()
        .from(HrGames)
        .where('hrId = :hrId', { hrId: hrId })
        .andWhere('gameId = :gameId', { gameId: params.gameId })
        .execute();
    }
  }
}
