import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogicalQuestionsEntity } from '@entities/index';
import { LogicalQuestionsController } from './controllers/logical-question.controller';
import { LogicalQuestionsRepository } from './repositories/logical-question.repository';
import { LogicalQuestionsService } from './service/logical-question.service';

@Module({
  imports: [TypeOrmModule.forFeature([LogicalQuestionsEntity])],
  controllers: [LogicalQuestionsController],
  providers: [LogicalQuestionsService, LogicalQuestionsRepository],
  exports: [LogicalQuestionsService, LogicalQuestionsRepository],
})
export class LogicalQuestionsModule {}
