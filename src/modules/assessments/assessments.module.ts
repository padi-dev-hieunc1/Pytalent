import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentsEntity } from '@entities/index';
import { AssessmentsService } from './services/assessment.service';
import { AssessmentsRepository } from './repositories/assessment.repository';
import { AssessmentsController } from './controllers/assessments.controller';
import { UsersRepository } from '@modules/users/repositories/user.repository';
import { CandidateAssessmentsRepository } from './repositories/candidate-assessment.repository';
import { AssessmentGamesService } from '@modules/assessment-games/services/assessment-game.service';
import { AssessmentGamesRepository } from '@modules/assessment-games/repositories/assessment-game.repository';
import { GamesRepository } from '@modules/games/repositories/games.repository';
import { HrGamesRepository } from '@modules/hr-games/repositories/hr-game.repository';
import { MailService } from '@modules/mail/mail.service';
import { GameResultsRepository } from '@modules/results/repositories/result.repository';
// import { MailService } from '@modules/mail/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([AssessmentsEntity])],
  controllers: [AssessmentsController],
  providers: [
    AssessmentsService,
    AssessmentGamesService,
    AssessmentsRepository,
    UsersRepository,
    GamesRepository,
    HrGamesRepository,
    CandidateAssessmentsRepository,
    AssessmentGamesRepository,
    GameResultsRepository,
    MailService,
  ],
  exports: [
    AssessmentsService,
    AssessmentsRepository,
    CandidateAssessmentsRepository,
  ],
})
export class AssessmentsModule {}
