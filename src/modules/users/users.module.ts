import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersRepository } from '@modules/users/repositories/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '@entities/index';
import { UsersAdminController } from '@modules/users/controllers/users.admin.controller';
import { UsersController } from './controllers/users.user.controller';
// import { CandidateAssessmentsRepository } from '@modules/assessments/repositories/candidate-assessment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity])],
  controllers: [UsersAdminController, UsersController],
  providers: [
    UsersService,
    UsersRepository,
    // CandidateAssessmentsRepository,
  ],
  exports: [
    UsersService,
    UsersRepository,
    // CandidateAssessmentsRepository,
  ],
})
export class UsersModule {}
