import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CustomizeException } from '@exception/customize.exception';
import { plainToClass } from 'class-transformer';
import { Assessments } from '@entities/assessments.entity';
import { AssessmentGamesRepository } from '../repositories/assessment-game.repository';
import {
  CreateAssessmentGameInterface,
  DeleteAssessmentGameInterface,
} from '@shared/interfaces/assessment-game.interface';
import { AssessmentsRepository } from '@modules/assessments/repositories/assessment.repository';
import { GamesRepository } from '@modules/games/repositories/games.repository';
import { Games } from '@entities/games.entity';
import { AssessmentGames } from '@entities/assessment-game.entity';
import { HrGamesRepository } from '@modules/hr-games/repositories/hr-game.repository';
import { HrGames } from '@entities/hr-games.entity';

@Injectable()
export class AssessmentGamesService {
  constructor(
    private assessmentGamesRepository: AssessmentGamesRepository,
    private assessmentsRepository: AssessmentsRepository,
    private gamesRepository: GamesRepository,
    private hrGamesRepository: HrGamesRepository,
    private readonly i18n: I18nService,
  ) {}

  async checkExistedAssessment(assessmentId: number) {
    const assessment: Assessments = await this.assessmentsRepository.findOne({
      where: {
        id: assessmentId,
      },
    });

    if (assessment) return true;
    else return false;
  }

  async checkExistedGame(gameId: number) {
    const game: Games = await this.gamesRepository.findOne({
      where: {
        id: gameId,
      },
    });

    if (game) return true;
    else return false;
  }

  // check hr have permission to access game
  async checkPermissionGameOfHr(hrId: number, gameId: number) {
    const existedHrGame: HrGames = await this.hrGamesRepository.findOne({
      where: {
        hrId: hrId,
        gameId: gameId,
      },
    });

    if (existedHrGame) return true;
    else return false;
  }

  async createAssessmentGame(params: CreateAssessmentGameInterface) {
    let assessment_game: CreateAssessmentGameInterface;

    const existed_assessment = await this.checkExistedAssessment(
      params.assessmentId,
    );

    const existed_game = await this.checkExistedGame(params.gameId);

    if (!existed_assessment) {
      throw new CustomizeException(this.i18n.t('message.ASSESSMENT_NOT_FOUND'));
    }

    if (!existed_game) {
      throw new CustomizeException(this.i18n.t('message.GAME_NOT_FOUND'));
    }

    if (existed_assessment && existed_game) {
      const existed_assessment_game: AssessmentGames =
        await this.assessmentGamesRepository.findOne({
          where: {
            assessmentId: params.assessmentId,
            gameId: params.gameId,
          },
        });

      if (!existed_assessment_game) {
        const assessment: Assessments =
          await this.assessmentsRepository.findOne({
            where: {
              id: params.assessmentId,
            },
            relations: ['hr'],
          });

        const check_permission = await this.checkPermissionGameOfHr(
          assessment.hrId,
          params.gameId,
        );

        if (check_permission) {
          const paramCreate: CreateAssessmentGameInterface = plainToClass(
            AssessmentGames,
            {
              assessmentId: params.assessmentId,
              gameId: params.gameId,
            },
          );

          assessment_game = await this.assessmentGamesRepository.save(
            paramCreate,
          );

          return assessment_game;
        } else {
          throw new CustomizeException(
            this.i18n.t('message.HR_GAME_NOT_FOUND'),
          );
        }
      } else {
        return null;
      }
    }
  }

  async getAllGamesInAssessment(assessmentId: number) {
    const existed_assessment = await this.checkExistedAssessment(assessmentId);

    if (existed_assessment) {
      const all_games: AssessmentGames[] =
        await this.assessmentGamesRepository.findAllGames(assessmentId);

      if (all_games) return all_games;
      else
        throw new CustomizeException(
          this.i18n.t('message.NO_GAMES_IN_ASSESSMENT'),
        );
    } else {
      throw new CustomizeException(this.i18n.t('message.ASSESSMENT_NOT_FOUND'));
    }
  }

  async deleteAssessmentGame(
    assessmentId: number,
    params: DeleteAssessmentGameInterface,
  ) {
    const existedAssessment = await this.checkExistedAssessment(assessmentId);
    const existedGame = await this.checkExistedGame(params.gameId);

    if (!existedAssessment)
      throw new CustomizeException(this.i18n.t('message.ASSESSMENT_NOT_FOUND'));

    if (!existedGame)
      throw new CustomizeException(this.i18n.t('message.GAME_NOT_FOUND'));

    if (existedAssessment && existedGame) {
      return await this.assessmentGamesRepository
        .createQueryBuilder()
        .delete()
        .from(AssessmentGames)
        .where('assessmentId = :assessmentId', { assessmentId: assessmentId })
        .andWhere('gameId = :gameId', { gameId: params.gameId })
        .execute();
    }
  }
}
