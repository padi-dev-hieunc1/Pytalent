import { Injectable } from '@nestjs/common';
import { Users } from '@entities/users.entity';
import { plainToClass } from 'class-transformer';
import { UsersRepository } from '../../users/repositories/user.repository';
import { RoleEnum } from '@common/enum/role.enum';
import { I18nService } from 'nestjs-i18n';
import { CustomizeException } from '@exception/customize.exception';
import { GamesRepository } from '@modules/games/repositories/games.repository';
import { Games } from '@entities/games.entity';
import { GameResultsRepository } from '../repositories/result.repository';
import { AssessmentsRepository } from '@modules/assessments/repositories/assessment.repository';
import { Assessments } from '@entities/assessments.entity';
import {
  ContinueGameResultInterface,
  CreateInitialGameResultInterface,
  UpdateGameResultInterface,
} from '@shared/interfaces/game-result.interface';
import { GameResults } from '@entities/games-results.entity';
import { GameResultStatusEnum } from '@common/enum/game-result-status.enum';
import { LogicalAnswersRepository } from '../repositories/logical-answer.repository';
import { LogicalQuestionsRepository } from '@modules/logical-questions/repositories/logical-question.repository';
import { GameCategoryEnum } from '@common/enum/game-category.enum';
import { AnswerStatusEnum } from '@common/enum/answer-status.enum';

@Injectable()
export class GameResultsService {
  constructor(
    private gameResultRepository: GameResultsRepository,
    private usersRepository: UsersRepository,
    private assessmentsRepository: AssessmentsRepository,
    private gamesRepository: GamesRepository,
    private logicalAnswerRepository: LogicalAnswersRepository,
    private logicalQuestionRepository: LogicalQuestionsRepository,
    private readonly i18n: I18nService,
  ) {}

  async checkExistedCandidate(candidateId: number) {
    const candidate: Users = await this.usersRepository.findOne({
      where: {
        id: candidateId,
        role: RoleEnum.CANDIDATE,
      },
    });

    if (candidate) return true;
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

  async checkExistedAssessment(assessmentId: number) {
    const assessment: Assessments = await this.assessmentsRepository.findOne({
      where: {
        id: assessmentId,
      },
    });

    if (assessment) return true;
    else return false;
  }

  async getDetailGameResult(resultId: number) {
    const game_result: GameResults = await this.gameResultRepository.findOne({
      where: {
        id: resultId,
      },
      select: [
        'id',
        'complete_question',
        'complete_time',
        'current_question_level',
        'score',
        'status',
      ],
    });

    if (game_result) return game_result;
    else throw new CustomizeException(this.i18n.t('message.RESULT_NOT_FOUND'));
  }

  async createGameResults(params: CreateInitialGameResultInterface) {
    const existedCandidate = await this.checkExistedCandidate(
      params.candidateId,
    );
    const existedGame = await this.checkExistedGame(params.gameId);
    const existedAssessment = await this.checkExistedAssessment(
      params.assessmentId,
    );

    if (!existedCandidate)
      throw new CustomizeException(this.i18n.t('message.CANDIDATE_NOT_FOUND'));

    if (!existedGame)
      throw new CustomizeException(this.i18n.t('message.GAME_NOT_FOUND'));

    if (!existedAssessment)
      throw new CustomizeException(this.i18n.t('message.ASSESSMENT_NOT_FOUND'));

    if (existedCandidate && existedGame && existedAssessment) {
      const existedGameResult: GameResults =
        await this.gameResultRepository.findOne({
          where: {
            candidateId: params.candidateId,
            gameId: params.gameId,
            assessmentId: params.assessmentId,
          },
        });

      if (existedGameResult) {
        if (existedGameResult.status === GameResultStatusEnum.NOT_COMPLETED) {
          return existedGameResult;
        } else {
          // Game completed, catch error
          throw new CustomizeException(this.i18n.t('message.GAME_PLAY_ONCE'));
        }
      } else {
        // check start time to play game
        const current_time = new Date();
        const assessment = await this.assessmentsRepository.findOne({
          where: {
            id: params.assessmentId,
          },
        });

        const start_time = assessment.start_time;

        if (start_time.getTime() > current_time.getTime()) {
          throw new CustomizeException(
            this.i18n.t('message.ASSESSMENT_NOT_START'),
          );
        } else {
          const paramCreate: CreateInitialGameResultInterface = plainToClass(
            GameResults,
            {
              assessmentId: params.assessmentId,
              gameId: params.gameId,
              candidateId: params.candidateId,
              status: GameResultStatusEnum.NOT_COMPLETED,
              current_question_level: 1,
            },
          );

          const game_result = await this.gameResultRepository.save(paramCreate);

          return game_result;
        }
      }
    }
  }

  async updateGameResult(resultId: number, check: number) {
    const existedGameResult: GameResults =
      await this.gameResultRepository.findOne({
        where: {
          id: resultId,
        },
      });

    const game = await this.gamesRepository.findOne({
      where: {
        id: existedGameResult.gameId,
      },
    });

    if (!existedGameResult)
      throw new CustomizeException(this.i18n.t('message.RESULT_NOT_FOUND'));

    let paramUpdate: UpdateGameResultInterface;
    if (game.category === GameCategoryEnum.LOGICAL) {
      const current_time = new Date();
      const complete_time = existedGameResult.complete_time;

      let time = existedGameResult.complete_time;

      if (complete_time === 0) {
        time =
          (current_time.getTime() - existedGameResult.created_at.getTime()) /
          1000;
      } else {
        time +=
          (current_time.getTime() - existedGameResult.updated_at.getTime()) /
          1000;
      }

      if (time <= 90) {
        paramUpdate = plainToClass(GameResults, {
          status: GameResultStatusEnum.NOT_COMPLETED,
          current_question_level: existedGameResult.current_question_level + 1,
          complete_question:
            check !== 3
              ? existedGameResult.complete_question + 1
              : existedGameResult.complete_question,
          complete_time: time,
          score:
            check === 1 ? existedGameResult.score + 1 : existedGameResult.score,
        });
      } else if (time > 90 || existedGameResult.current_question_level > 20) {
        paramUpdate = plainToClass(GameResults, {
          status: GameResultStatusEnum.COMPLETED,
          current_question_level: existedGameResult.current_question_level,
          complete_question: existedGameResult.complete_question,
          complete_time: 90,
          score: existedGameResult.score,
        });
      }
    } else {
      const current_time = new Date();
      const complete_time = existedGameResult.complete_time;
      let time = existedGameResult.complete_time;
      if (complete_time === 0) {
        time =
          (current_time.getTime() - existedGameResult.created_at.getTime()) /
          1000;
      } else {
        time +=
          (current_time.getTime() - existedGameResult.updated_at.getTime()) /
          1000;
      }

      paramUpdate = plainToClass(GameResults, {
        status: GameResultStatusEnum.NOT_COMPLETED,
        current_question_level: existedGameResult.current_question_level + 1,
        complete_question: existedGameResult.current_question_level,
        complete_time: time,
        score: existedGameResult.score + 1,
      });
    }

    const updated_game_result = await this.gameResultRepository
      .createQueryBuilder('game_result')
      .update(GameResults)
      .set(paramUpdate)
      .where('id = :id', { id: resultId })
      .execute();

    if (updated_game_result?.affected === 1) return paramUpdate;
  }

  async findNextQuestion(resultId: number) {
    const game_result = await this.getDetailGameResult(resultId);

    if (game_result) {
      const next_logical_answer = await this.logicalAnswerRepository
        .createQueryBuilder('logical_answer')
        .where('logical_answer.resultId = :resultId', { resultId })
        .andWhere('logical_answer.status = :status', {
          status: AnswerStatusEnum.NOT_DONE,
        })
        .orderBy('logical_answer.id', 'ASC')
        .getOne();

      if (next_logical_answer) {
        const next_question = await this.logicalQuestionRepository.findOne({
          where: {
            id: next_logical_answer.questionId,
          },
          select: ['id', 'first_statement', 'second_statement', 'conclusion'],
        });
        return next_question;
      } else {
        return null;
      }
    }

    // if (game_result) {
    //   const first_logical_answer = await this.logicalAnswerRepository
    //     .createQueryBuilder('logical_answer')
    //     .where('logical_answer.resultId = :resultId', { resultId })
    //     .orderBy('logical_answer.id', 'ASC')
    //     .getOne();

    //   if (first_logical_answer) {
    //     const continue_id = first_logical_answer.id + current - 1;

    //     const next_logical_answer = await this.logicalAnswerRepository.findOne({
    //       where: {
    //         id: continue_id,
    //       },
    //     });

    //     if (next_logical_answer) {
    //       const next_question = await this.logicalQuestionRepository.findOne({
    //         where: {
    //           id: next_logical_answer.questionId,
    //         },
    //         select: ['id', 'first_statement', 'second_statement', 'conclusion'],
    //       });
    //       return next_question;
    //     }
    //   }
    // }
  }

  async continueLogicalGame(params: ContinueGameResultInterface) {
    const game_result = await this.gameResultRepository.findOne({
      where: {
        assessmentId: params.assessmentId,
        gameId: params.gameId,
        candidateId: params.candidateId,
      },
    });

    const resultId = game_result.id;

    if (game_result) {
      const paramUpdate = plainToClass(GameResults, {
        updated_at: new Date(),
      });

      const updated_game_result = await this.gameResultRepository.update(
        resultId,
        paramUpdate,
      );

      if (updated_game_result.affected === 1) {
        return await this.findNextQuestion(resultId);
      } else {
        return null;
      }
    } else {
      throw new CustomizeException(this.i18n.t('message.RESULT_NOT_FOUND'));
    }
  }

  async updateGameResultStatus(resultId: number) {
    const paramUpdate = plainToClass(GameResults, {
      status: GameResultStatusEnum.COMPLETED,
    });

    await this.gameResultRepository.update(resultId, paramUpdate);
  }

  async getAllResults() {
    const all_results = await this.gameResultRepository.find({});

    return all_results;
  }

  async completeGame(resultId: number) {
    const result = await this.getDetailGameResult(resultId);

    if (result) {
      const paramUpdate = plainToClass(GameResults, {
        status: GameResultStatusEnum.COMPLETED,
        complete_time: 90,
        current_question_level: result.current_question_level,
        complete_question: result.complete_question,
        score: result.score,
      });

      const updated_game_result = await this.gameResultRepository.update(
        resultId,
        paramUpdate,
      );

      if (updated_game_result.affected === 1) {
        return paramUpdate;
      } else {
        return null;
      }
    }
  }
}
