import { RoleEnum } from '@enum/role.enum';

export interface UserModel {
  id: number;
  email: string;
  password: string;
}

export interface FindUserInterface {
  email: string;
  password: string;
}

export interface CreateUserInterface extends FindUserInterface {
  username: string;
  role: RoleEnum;
}

// export type UserGetResponse = Omit<UserModel, 'userId' | 'password'>;
