import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '@modules/users/repositories/user.repository';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UsersRepository,
    private jwtService: JwtService,
    private readonly i18n: I18nService,
  ) {}

  async login(params: any) {
    const { email, password } = params;
    const user = await this.userRepository.validateUser(email, password);
    if (user) {
      return this.jwtService.sign(JSON.parse(JSON.stringify(user)));
    }
  }
}
