import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentsEntity } from '@entities/index';
import { AssessmentsService } from './services/assessment.service';
import { AssessmentsRepository } from './repositories/assessment.repository';
import { AssessmentsController } from './controllers/assessments.controller';
import { UsersRepository } from '@modules/users/repositories/user.repository';
import { CandidateAssessmentsRepository } from './repositories/candidate-assessment.repository';
import { MailService } from '@modules/mail/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([AssessmentsEntity])],
  controllers: [AssessmentsController],
  providers: [
    AssessmentsService,
    AssessmentsRepository,
    UsersRepository,
    CandidateAssessmentsRepository,
    MailService,
  ],
  exports: [
    AssessmentsService,
    AssessmentsRepository,
    UsersRepository,
    CandidateAssessmentsRepository,
    MailService,
  ],
})
export class AssessmentsModule {}
