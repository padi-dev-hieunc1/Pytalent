import { AssessmentGamesEntity } from '@entities';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AssessmentGamesRepository extends Repository<AssessmentGamesEntity> {
  constructor(private dataSource: DataSource) {
    super(AssessmentGamesEntity, dataSource.createEntityManager());
  }

  async findAllGames(assessmentId: number): Promise<any> {
    return await this.find({
      where: {
        assessmentId: assessmentId,
      },
      relations: ['game'],
    });
  }
}
