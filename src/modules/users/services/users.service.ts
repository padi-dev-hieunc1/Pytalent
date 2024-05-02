import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@modules/users/repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { Users } from '@entities/users.entity';
import { plainToClass } from 'class-transformer';
import {
  CreateUserInterface,
  FindUserInterface,
} from '@interfaces/user.interface';
import { CustomizeException } from '@exception/customize.exception';
import { I18nService } from 'nestjs-i18n';
import { RoleEnum } from '@common/enum/role.enum';
// import { CandidateAssessmentsRepository } from '@modules/assessments/repositories/candidate-assessment.repository';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    // private candidateAssessmentRepository: CandidateAssessmentsRepository,
    private readonly i18n: I18nService,
  ) {}

  async checkUser(params: FindUserInterface) {
    const user: Users = await this.usersRepository.findOne({
      where: {
        email: params.email,
      },
    });
    if (!user) {
      return true;
    } else {
      return false;
    }
  }

  async createUser(params: CreateUserInterface) {
    const notExistedUser = this.checkUser(params);
    let user: CreateUserInterface & Users;

    if (notExistedUser) {
      const paramCreate: CreateUserInterface = plainToClass(Users, {
        email: params.email,
        password: await bcrypt.hash(params.password, 10),
        username: params.username,
        role: params.role,
      });
      user = await this.usersRepository.save(paramCreate);
    }
    return user;
  }

  async createHr(params: CreateUserInterface) {
    const notExistedUser = this.checkUser(params);
    let hr: CreateUserInterface & Users;

    if (notExistedUser) {
      if (params.role !== RoleEnum.HR) {
        throw new CustomizeException(this.i18n.t('message.ROLE_MUST_BE_HR'));
      }

      const paramCreate: CreateUserInterface = plainToClass(Users, {
        email: params.email,
        password: await bcrypt.hash(params.password, 10),
        username: params.username,
        role: RoleEnum.HR,
      });
      hr = await this.usersRepository.save(paramCreate);
    }
    return hr;
  }

  async getUserInformationById(userId: number) {
    const user: Users = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      select: ['email', 'username', 'role'],
    });

    if (user) {
      return user;
    }
    throw new CustomizeException(this.i18n.t('message.USER_NOT_FOUND'));
  }

  async getListHr() {
    const listHrs = await this.usersRepository.findAllHrs();

    return listHrs;
  }

  async updatePassword(params: FindUserInterface) {
    const user: Users = await this.usersRepository.findOne({
      where: {
        email: params.email,
      },
    });

    if (user) {
      const isPasswordValid = await bcrypt.compare(
        params.password,
        user.password,
      );

      if (isPasswordValid) {
        throw new CustomizeException(
          this.i18n.t('message.PASSWORD_NOT_CHANGE'),
        );
      }

      const paramUpdate: FindUserInterface = plainToClass(Users, {
        email: params.email,
        password: await bcrypt.hash(params.password, 10),
      });

      const updatedUser = await this.usersRepository.update(
        user.id,
        paramUpdate,
      );

      return updatedUser;
    } else {
      throw new CustomizeException(this.i18n.t('message.USER_NOT_FOUND'));
    }
  }
}
