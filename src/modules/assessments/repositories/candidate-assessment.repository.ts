import { CandidateAssessments } from '@entities/candidate-assessment';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CandidateAssessmentsRepository extends Repository<CandidateAssessments> {
  constructor(private dataSource: DataSource) {
    super(CandidateAssessments, dataSource.createEntityManager());
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
