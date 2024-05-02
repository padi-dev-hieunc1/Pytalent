import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '@modules/users/repositories/user.repository';
import { FindUserInterface } from '@shared/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async login(params: any) {
    const { email, password } = params;
    const user = await this.userRepository.validateUser(email, password);
    if (user) {
      return this.jwtService.sign(JSON.parse(JSON.stringify(user)));
    }
  }

  async getUserInfo(params: FindUserInterface) {
    const user = await this.userRepository.findOne({
      where: {
        email: params.email,
      },
      select: ['id', 'email'],
    });

    if (user) return user;
    else return null;
  }
}
