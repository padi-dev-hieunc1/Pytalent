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

  async getExistedHrGame(hrId: number, gameId: number) {
    const existedHrGame: HrGames = await this.hrGamesRepository.findOne({
      where: {
        hrId: hrId,
        gameId: gameId,
      },
    });

    return existedHrGame;
  }

  async createHrGames(params: CreateHrGameInterface) {
    const existedHr = await this.checkExistedHr(params.hrId);
    const existedGame = await this.checkExistedGame(params.gameId);

    if (!existedHr)
      throw new CustomizeException(this.i18n.t('message.HR_NOT_FOUND'));

    if (!existedGame)
      throw new CustomizeException(this.i18n.t('message.GAME_NOT_FOUND'));

    const existedHrGame: HrGames = await this.getExistedHrGame(
      params.hrId,
      params.gameId,
    );

    if (existedHrGame)
      throw new CustomizeException(this.i18n.t('message.HR_GAME_EXISTED'));

    const paramCreate: CreateHrGameInterface = plainToClass(HrGames, {
      hrId: params.hrId,
      gameId: params.gameId,
    });

    const hrGame = await this.hrGamesRepository.save(paramCreate);

    return hrGame;
  }

  async getGamesByHrId(hrId: number) {
    const existedHr = await this.checkExistedHr(hrId);

    if (!existedHr)
      throw new CustomizeException(this.i18n.t('message.HR_NOT_FOUND'));

    const listGames: HrGames[] =
      await this.hrGamesRepository.findAllGamesByHrId(hrId);

    if (listGames.length === 0)
      throw new CustomizeException(
        'This hr have not been authorized to access to any games before',
      );

    return listGames;
  }

  async getAllHrGames() {
    const allHrGames: HrGames[] = await this.hrGamesRepository.findAllHrGames();

    if (allHrGames.length === 0)
      throw new CustomizeException(
        'There are not any games authorized to any hr',
      );

    return allHrGames;
  }

  async deleteHrGame(hrId: number, params: DeleteHrGameInterface) {
    const existedHr = await this.checkExistedHr(hrId);
    const existedGame = await this.checkExistedGame(params.gameId);

    if (!existedHr)
      throw new CustomizeException(this.i18n.t('message.HR_NOT_FOUND'));

    if (!existedGame)
      throw new CustomizeException(this.i18n.t('message.GAME_NOT_FOUND'));

    const existedHrGame: HrGames = await this.getExistedHrGame(
      hrId,
      params.gameId,
    );

    if (!existedHrGame)
      throw new CustomizeException(this.i18n.t('message.HR_GAME_NOT_FOUND'));

    return await this.hrGamesRepository
      .createQueryBuilder()
      .delete()
      .from(HrGames)
      .where('hrId = :hrId', { hrId: hrId })
      .andWhere('gameId = :gameId', { gameId: params.gameId })
      .execute();
  }
}
