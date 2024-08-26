import { Assessments } from '@entities/assessments.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AssessmentsRepository extends Repository<Assessments> {
  constructor(private dataSource: DataSource) {
    super(Assessments, dataSource.createEntityManager());
  }

  async findAllAssessments(hrId: number): Promise<any> {
    return await this.find({
      where: {
        hrId: hrId,
      },
    });
  }
}
