import { Injectable } from '@nestjs/common';
import { Users } from '@entities/users.entity';
import { plainToClass } from 'class-transformer';
import { HrGamesRepository } from '../repositories/hr-game.repository';
import { UsersRepository } from '../repositories/user.repository';
import { CreateHrGameInterface } from '@shared/interfaces/hr-game.interface';
import { HrGames } from '@entities/hr-games.entity';
import { RoleEnum } from '@common/enum/role.enum';
import { I18nService } from 'nestjs-i18n';
import { CustomizeException } from '@exception/customize.exception';

@Injectable()
export class HrGamesService {
  constructor(
    private hrGamesRepository: HrGamesRepository,
    private usersRepository: UsersRepository,
    private readonly i18n: I18nService,
  ) {}

  async createHrGames(params: CreateHrGameInterface) {
    const hr: Users = await this.usersRepository.findOne({
      where: {
        id: params.hrId,
        role: RoleEnum.HR,
      },
    });

    let hrGame: CreateHrGameInterface;

    if (hr) {
      const paramCreate: CreateHrGameInterface = plainToClass(HrGames, {
        hrId: params.hrId,
        category: params.category,
      });

      const existedHrGame: HrGames = await this.hrGamesRepository.findOne({
        where: {
          hrId: paramCreate.hrId,
          category: paramCreate.category,
        },
      });

      if (existedHrGame) {
        throw new CustomizeException(this.i18n.t('message.HR_GAME_EXISTED'));
      } else {
        hrGame = await this.hrGamesRepository.save(paramCreate);
      }
    } else {
      throw new CustomizeException(this.i18n.t('message.HR_NOT_FOUND'));
    }

    return hrGame;
  }

  async getCategoryGamesOfHr(hrId: number) {
    const hr: Users = await this.usersRepository.findOne({
      where: {
        id: hrId,
        role: RoleEnum.HR,
      },
    });

    if (hr) {
      const listCategoryGames: HrGames[] =
        await this.hrGamesRepository.findAllCategoryGames(hrId);

      const arrayListCategoryGames: string[] = [];

      listCategoryGames.map((categoryGame) =>
        arrayListCategoryGames.push(categoryGame.category),
      );

      return arrayListCategoryGames;
    } else {
      return null;
    }
  }
}
