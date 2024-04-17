import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersRepository } from '@modules/users/repositories/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '@entities/index';
import { UsersAdminController } from '@modules/users/controllers/users.admin.controller';
import { HrGamesRepository } from './repositories/hr-game.repository';
import { HrGamesService } from './services/hr-game.service';
import { CandidateAssessmentsRepository } from '@modules/assessments/repositories/candidate-assessment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity])],
  controllers: [UsersAdminController],
  providers: [
    UsersService,
    UsersRepository,
    HrGamesRepository,
    HrGamesService,
    CandidateAssessmentsRepository,
  ],
  exports: [
    UsersService,
    UsersRepository,
    HrGamesRepository,
    HrGamesService,
    CandidateAssessmentsRepository,
  ],
})
export class UsersModule {}
