import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UsersEntity } from '@entities/index';
import { Users } from '@entities/users.entity';
import * as bcrypt from 'bcrypt';
import { CustomizeException } from '@exception/customize.exception';
import { I18nService } from 'nestjs-i18n';
import { RoleEnum } from '@common/enum/role.enum';

@Injectable()
export class UsersRepository extends Repository<UsersEntity> {
  constructor(
    private dataSource: DataSource,
    private readonly i18n: I18nService,
  ) {
    super(UsersEntity, dataSource.createEntityManager());
  }

  async findAllHrs(): Promise<any> {
    return await this.find({
      where: {
        role: RoleEnum.HR,
      },
      select: ['id', 'email', 'username', 'role'],
    });
  }

  async validateUser(email: string, password: string): Promise<Users> {
    const user = await this.findOne({ where: { email: email } });
    if (!user) {
      throw new CustomizeException(this.i18n.t('message.IS_INCORRECT_EMAIL'));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new CustomizeException(
        this.i18n.t('message.IS_INCORRECT_PASSWORD'),
      );
    }

    return user;
  }
}
