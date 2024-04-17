import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@modules/users/repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { Users } from '@entities/users.entity';
import { plainToClass } from 'class-transformer';
import {
  createUserInterface,
  FindUserInterface,
} from '@interfaces/user.interface';
import { RoleEnum } from '@enum/role.enum';
import { CustomizeException } from '@exception/customize.exception';
import { I18nService } from 'nestjs-i18n';
import { CandidateAssessmentsRepository } from '@modules/assessments/repositories/candidate-assessment.repository';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private candidateAssessmentRepository: CandidateAssessmentsRepository,
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

  async createUser(params: createUserInterface) {
    const existedUser = this.checkUser(params);
    let user: createUserInterface & Users;

    if (existedUser) {
      const paramCreate: createUserInterface = plainToClass(Users, {
        email: params.email,
        password: await bcrypt.hash(params.password, 10),
        username: params.username,
        role: RoleEnum.HR,
      });
      user = await this.usersRepository.save(paramCreate);
    }
    return user;
  }

  async getUserInformationByEmail(params: any) {
    const { email } = params;
    const user: Users = await this.usersRepository.findOne({
      where: {
        email: email,
      },
    });

    if (user) {
      return user;
    }
    throw new CustomizeException(this.i18n.t('message.IS_INCORRECT_EMAIL'));
  }

  async getListHr() {
    const listHrs = await this.usersRepository.findAllHrs();

    return listHrs;
  }

  async getAllResults() {
    const results = await this.candidateAssessmentRepository.findAllResults();

    if (results) {
      return results;
    } else {
      throw new CustomizeException(this.i18n.t('message.RESULT_NOT_FOUND'));
    }
  }

  async updatePassword(params: FindUserInterface) {
    const candidate: Users = await this.usersRepository.findOne({
      where: {
        email: params.email,
      },
    });

    if (candidate) {
      const paramUpdate: FindUserInterface = plainToClass(Users, {
        email: params.email,
        password: await bcrypt.hash(params.password, 10),
      });

      const updatedUser = await this.usersRepository.update(
        candidate.id,
        paramUpdate,
      );

      return updatedUser;
    } else {
      throw new CustomizeException(this.i18n.t('message.USER_NOT_FOUND'));
    }
  }
}
