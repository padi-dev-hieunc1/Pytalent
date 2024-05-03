import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentGamesEntity } from '@entities/index';
import { AssessmentGamesController } from './controllers/assessment-game.controller';
import { AssessmentGamesService } from './services/assessment-game.service';
import { AssessmentGamesRepository } from './repositories/assessment-game.repository';
import { GamesRepository } from '@modules/games/repositories/games.repository';
import { AssessmentsRepository } from '@modules/assessments/repositories/assessment.repository';
import { AssessmentsService } from '@modules/assessments/services/assessment.service';
import { UsersRepository } from '@modules/users/repositories/user.repository';
import { CandidateAssessmentsRepository } from '@modules/assessments/repositories/candidate-assessment.repository';
import { HrGamesRepository } from '@modules/hr-games/repositories/hr-game.repository';
import { GameResultsRepository } from '@modules/results/repositories/result.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AssessmentGamesEntity])],
  controllers: [AssessmentGamesController],
  providers: [
    AssessmentGamesService,
    AssessmentsService,
    AssessmentGamesRepository,
    GamesRepository,
    UsersRepository,
    HrGamesRepository,
    AssessmentsRepository,
    GameResultsRepository,
    CandidateAssessmentsRepository,
  ],
  exports: [AssessmentGamesService, AssessmentGamesRepository],
})
export class AssessmentGamesModule {}
