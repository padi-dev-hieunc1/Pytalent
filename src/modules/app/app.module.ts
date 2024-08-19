import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import databaseConfig from '../../databases/config/index';
import * as path from 'path';
import {
  AcceptLanguageResolver,
  CookieResolver,
  I18nModule,
} from 'nestjs-i18n';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from '@modules/users/users.module';
import { AuthModule } from '@modules/auth/auth.module';
import { HppMiddleware } from '@middleware/hpp.middleware';
import { Users } from '@entities/users.entity';
import { Assessments } from '@entities/assessments.entity';
import { HrGames } from '@entities/hr-games.entity';
import { CandidateAssessments } from '@entities/candidate-assessment';
import { LogicalQuestions } from '@entities/logical-questions.entity';
import { ConfigModule } from '@nestjs/config';
import { Games } from '@entities/games.entity';
import { AssessmentGames } from '@entities/assessment-game.entity';
import { GameResults } from '@entities/games-results.entity';
import { LogicalAnswers } from '@entities/logical-answers.entity';
import { MemoryAnswers } from '@entities/memory-answers.entity';
import { GamesModule } from '@modules/games/games.module';
import { env } from '@env';
import { HrGamesModule } from '@modules/hr-games/hr-game.module';
import { AssessmentsModule } from '@modules/assessments/assessments.module';
import { AssessmentGamesModule } from '@modules/assessment-games/assessment-game.module';
import { GameResultsModule } from '@modules/results/result.module';
import { LogicalQuestionsModule } from '@modules/logical-questions/logical-question.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ScheduleModule } from '@nestjs/schedule';
// import { TasksService } from '@modules/task/task.service';
// import { MailModule } from '@modules/mail/mail.module';

const options = databaseConfig as TypeOrmModuleOptions;

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),

    TypeOrmModule.forFeature([
      Users,
      Assessments,
      Games,
      HrGames,
      CandidateAssessments,
      LogicalQuestions,
      AssessmentGames,
      GameResults,
      LogicalAnswers,
      MemoryAnswers,
    ]),

    TypeOrmModule.forRoot({
      ...options,
      autoLoadEntities: true,
      // entities: ['src/**/*.entity.{ts,js}'],
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '../../', '/i18n/'),
        watch: true,
      },
      resolvers: [new CookieResolver(), AcceptLanguageResolver],
    }),
    MailerModule.forRoot({
      transport: {
        host: env.email.host,
        auth: {
          user: env.email.authUser,
          pass: env.email.authPassword,
        },
      },
    }),
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),

    ScheduleModule.forRoot(),

    //other module
    UsersModule,
    AuthModule,
    AssessmentsModule,
    GamesModule,
    HrGamesModule,
    AssessmentGamesModule,
    GameResultsModule,
    LogicalQuestionsModule,
  ],
  controllers: [AppController],
  // providers: [AppService, TasksService],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HppMiddleware).forRoutes('*');
  }
}
