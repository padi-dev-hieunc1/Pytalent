import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { UsersEntity } from '@entities/index';
import { RoleEnum } from '@enum/role.enum';

export default class CreateUsers implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const current = new Date();
    const firstThisWeek = current.getDate() - current.getDay() + 1;
    const users = [
      {
        id: 1,
        email: 'admin1@gmail.com',
        password:
          '$2b$10$8NoeFbeBargsDsClhpfkDexfk0RtV6kDSJa/yTOwJ3Wbo3n6e3k/.', //123456
        username: 'ADMIN1',
        role: RoleEnum.ADMIN,
        created_at: new Date(
          new Date().setDate(firstThisWeek - 7),
        ).toISOString(),
        updated_at: new Date(
          new Date().setDate(firstThisWeek - 7),
        ).toISOString(),
      },
      {
        id: 2,
        email: 'hr1@gmail.com',
        password:
          '$2b$10$8NoeFbeBargsDsClhpfkDexfk0RtV6kDSJa/yTOwJ3Wbo3n6e3k/.', //123456
        username: 'HR1',
        role: RoleEnum.HR,
        created_at: new Date(
          new Date().setDate(firstThisWeek - 7),
        ).toISOString(),
        updated_at: new Date(
          new Date().setDate(firstThisWeek - 7),
        ).toISOString(),
      },
      {
        id: 3,
        email: 'user1@gmail.com',
        password:
          '$2b$10$8NoeFbeBargsDsClhpfkDexfk0RtV6kDSJa/yTOwJ3Wbo3n6e3k/.', //123456
        username: 'CANDIDATE1',
        role: RoleEnum.CANDIDATE,
        created_at: new Date(
          new Date().setDate(firstThisWeek - 7),
        ).toISOString(),
        updated_at: new Date(
          new Date().setDate(firstThisWeek - 7),
        ).toISOString(),
      },
    ];
    await connection
      .createQueryBuilder()
      .insert()
      .into(UsersEntity)
      .values(users)
      .execute();
  }
}
