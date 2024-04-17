import { HrGamesEntity } from '@entities';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class HrGamesRepository extends Repository<HrGamesEntity> {
  constructor(private dataSource: DataSource) {
    super(HrGamesEntity, dataSource.createEntityManager());
  }

  async findAllCategoryGames(hrId: number): Promise<any> {
    return await this.find({
      where: {
        hrId: hrId,
      },
    });
  }
}
