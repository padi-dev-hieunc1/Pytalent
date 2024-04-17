import { CandidateAssessmentsEntity } from '@entities';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CandidateAssessmentsRepository extends Repository<CandidateAssessmentsEntity> {
  constructor(private dataSource: DataSource) {
    super(CandidateAssessmentsEntity, dataSource.createEntityManager());
  }

  async findAllResults(): Promise<any> {
    return await this.find({
      relations: ['candidate', 'assessment'],
    });
  }
}
