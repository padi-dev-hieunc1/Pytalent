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
    let assessmentGame: CreateAssessmentGameInterface;

    const existedAssessment = await this.checkExistedAssessment(
      params.assessmentId,
    );

    const existedGame = await this.checkExistedGame(params.gameId);

    if (!existedAssessment) {
      throw new CustomizeException(this.i18n.t('message.ASSESSMENT_NOT_FOUND'));
    }

    if (!existedGame) {
      throw new CustomizeException(this.i18n.t('message.GAME_NOT_FOUND'));
    }

    const existedAssessmentGame: AssessmentGames =
      await this.assessmentGamesRepository.findOne({
        where: {
          assessmentId: params.assessmentId,
          gameId: params.gameId,
        },
      });

    if (!existedAssessmentGame) {
      const assessment: Assessments = await this.assessmentsRepository.findOne({
        where: {
          id: params.assessmentId,
        },
        relations: ['hr'],
      });

      const checkPermission = await this.checkPermissionGameOfHr(
        assessment.hrId,
        params.gameId,
      );

      if (checkPermission) {
        const paramCreate: CreateAssessmentGameInterface = plainToClass(
          AssessmentGames,
          {
            assessmentId: params.assessmentId,
            gameId: params.gameId,
          },
        );

        assessmentGame = await this.assessmentGamesRepository.save(paramCreate);

        return assessmentGame;
      } else {
        throw new CustomizeException(this.i18n.t('message.HR_GAME_NOT_FOUND'));
      }
    } else {
      return null;
    }
  }

  async getAllGamesInAssessment(assessmentId: number) {
    const existedAssessment = await this.checkExistedAssessment(assessmentId);

    if (!existedAssessment)
      throw new CustomizeException(this.i18n.t('message.ASSESSMENT_NOT_FOUND'));

    const allGames: AssessmentGames[] =
      await this.assessmentGamesRepository.findAllGames(assessmentId);

    if (!allGames)
      throw new CustomizeException(
        this.i18n.t('message.NO_GAMES_IN_ASSESSMENT'),
      );

    return allGames;
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

    return await this.assessmentGamesRepository
      .createQueryBuilder()
      .delete()
      .from(AssessmentGames)
      .where('assessmentId = :assessmentId', { assessmentId: assessmentId })
      .andWhere('gameId = :gameId', { gameId: params.gameId })
      .execute();
  }
}
