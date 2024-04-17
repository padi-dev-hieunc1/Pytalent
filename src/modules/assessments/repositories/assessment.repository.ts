import { AssessmentsEntity } from '@entities';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AssessmentsRepository extends Repository<AssessmentsEntity> {
  constructor(private dataSource: DataSource) {
    super(AssessmentsEntity, dataSource.createEntityManager());
  }

  async findAllAssessments(hrId: number): Promise<any> {
    return await this.find({
      where: {
        hrId: hrId,
      },
    });
  }
}
