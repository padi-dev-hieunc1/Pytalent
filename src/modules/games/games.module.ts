import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesService } from './services/games.service';
import { GamesEntity } from '@entities';
import { GamesController } from './controllers/games.controller';
import { GamesRepository } from './repositories/games.repository';
import { LogicalQuestionsRepository } from './repositories/logical-questions.repository';
import { HrGamesRepository } from '@modules/users/repositories/hr-game.repository';
import { AssessmentsRepository } from '@modules/assessments/repositories/assessment.repository';
import { AnswerGamesRepository } from './repositories/answer-games.repository';
import { MemoryQuestionsRepository } from './repositories/memory-questions.repository';

@Module({
  imports: [TypeOrmModule.forFeature([GamesEntity])],
  controllers: [GamesController],
  providers: [
    GamesService,
    LogicalQuestionsRepository,
    MemoryQuestionsRepository,
    HrGamesRepository,
    GamesRepository,
    AssessmentsRepository,
    AnswerGamesRepository,
  ],
  exports: [
    GamesService,
    LogicalQuestionsRepository,
    MemoryQuestionsRepository,
    HrGamesRepository,
    GamesRepository,
    AssessmentsRepository,
    AnswerGamesRepository,
  ],
})
export class GamesModule {}
