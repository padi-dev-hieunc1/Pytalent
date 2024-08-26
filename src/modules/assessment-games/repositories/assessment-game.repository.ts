import { AssessmentGames } from '@entities/assessment-game.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AssessmentGamesRepository extends Repository<AssessmentGames> {
  constructor(private dataSource: DataSource) {
    super(AssessmentGames, dataSource.createEntityManager());
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
