import { CandidateAssessmentsEntity } from '@entities';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CandidateAssessmentsRepository extends Repository<CandidateAssessmentsEntity> {
  constructor(private dataSource: DataSource) {
    super(CandidateAssessmentsEntity, dataSource.createEntityManager());
  }

  async findAllCandidateAssessments(): Promise<any> {
    return await this.find({
      relations: ['candidate', 'assessment'],
    });
  }

  async findAssessmentsByCandidateId(candidateId: number): Promise<any> {
    return await this.find({
      where: {
        candidateId: candidateId,
      },
      relations: ['assessment'],
    });
  }
}
