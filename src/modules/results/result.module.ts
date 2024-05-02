import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameResults } from '@entities/games-results.entity';
import { GameResultsController } from './controllers/result.controller';
import { GameResultsService } from './services/result.service';
import { GameResultsRepository } from './repositories/result.repository';
import { AssessmentsRepository } from '@modules/assessments/repositories/assessment.repository';
import { GamesRepository } from '@modules/games/repositories/games.repository';
import { UsersRepository } from '@modules/users/repositories/user.repository';
import { LogicalAnswersController } from './controllers/logical-answer.controller';
import { LogicalAnswers } from '@entities/logical-answers.entity';
import { LogicalAnswersService } from './services/logical-answer.service';
import { LogicalAnswersRepository } from './repositories/logical-answer.repository';
import { MemoryAnswersRepository } from './repositories/memory-answer.repository';
import { LogicalQuestionsService } from '@modules/logical-questions/service/logical-question.service';
import { LogicalQuestionsRepository } from '@modules/logical-questions/repositories/logical-question.repository';
import { GamesService } from '@modules/games/services/games.service';
import { MemoryAnswersService } from './services/memory-answer.service';
import { MemoryAnswers } from '@entities/memory-answers.entity';
import { MemoryAnswersController } from './controllers/memory-answer.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameResults, LogicalAnswers, MemoryAnswers]),
  ],
  controllers: [
    GameResultsController,
    LogicalAnswersController,
    MemoryAnswersController,
  ],
  providers: [
    GameResultsService,
    LogicalAnswersService,
    MemoryAnswersService,
    LogicalQuestionsService,
    GamesService,
    GameResultsRepository,
    AssessmentsRepository,
    GamesRepository,
    UsersRepository,
    LogicalAnswersRepository,
    MemoryAnswersRepository,
    LogicalQuestionsRepository,
  ],
  exports: [
    GameResultsService,
    LogicalAnswersService,
    MemoryAnswersService,
    GameResultsRepository,
    LogicalAnswersRepository,
    MemoryAnswersRepository,
  ],
})
export class GameResultsModule {}
