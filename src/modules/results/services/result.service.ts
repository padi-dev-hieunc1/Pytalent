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
import { AnswerStatusEnum } from '@common/enum/answer-status.enum';
import { LogicalAnswersService } from './logical-answer.service';
import { LogicalQuestions } from '@entities/logical-questions.entity';

@Injectable()
export class GameResultsService {
  constructor(
    private gameResultRepository: GameResultsRepository,
    private usersRepository: UsersRepository,
    private assessmentsRepository: AssessmentsRepository,
    private gamesRepository: GamesRepository,
    private logicalAnswerRepository: LogicalAnswersRepository,
    private logicalQuestionRepository: LogicalQuestionsRepository,
    private logicalAnswerService: LogicalAnswersService,
    private readonly i18n: I18nService,
  ) {}

  async updateLogicalGameResult(resultId: number, checkAnswer: boolean) {
    const existedGameResult: GameResults = await this.getGameResult(resultId);

    const completeTime = existedGameResult.completeTime;
    const createdAt = existedGameResult.createdAt;
    const updatedAt = existedGameResult.updatedAt;

    const time = this.getTimePlay(completeTime, createdAt, updatedAt);

    const paramUpdate: UpdateGameResultInterface = plainToClass(GameResults, {
      status: GameResultStatusEnum.NOT_COMPLETED,
      currentQuestionLevel: existedGameResult.currentQuestionLevel + 1,
      completeQuestion: existedGameResult.completeQuestion + 1,
      completeTime: time,
      score:
        checkAnswer === true
          ? existedGameResult.score + 1
          : existedGameResult.score,
      updatedAt: new Date(Math.floor(new Date().getTime() / 1000) * 1000),
    });

    const updatedLogicalGameResult = await this.gameResultRepository
      .createQueryBuilder('game_result')
      .update(GameResults)
      .set(paramUpdate)
      .where('id = :id', { id: resultId })
      .execute();

    if (updatedLogicalGameResult?.affected === 1) return paramUpdate;
  }

  async updateMemoryGameResult(resultId: number) {
    const existedGameResult: GameResults = await this.getGameResult(resultId);

    const completeTime = existedGameResult.completeTime;
    const createdAt = existedGameResult.createdAt;
    const updatedAt = existedGameResult.updatedAt;

    const time = this.getTimePlay(completeTime, createdAt, updatedAt);

    const paramUpdate: UpdateGameResultInterface = plainToClass(GameResults, {
      status: GameResultStatusEnum.NOT_COMPLETED,
      currentQuestionLevel: existedGameResult.currentQuestionLevel + 1,
      completeQuestion: existedGameResult.currentQuestionLevel,
      completeTime: time,
      score: existedGameResult.score + 1,
      updatedAt: Date.now(),
    });

    const updatedMemoryGameResult = await this.gameResultRepository
      .createQueryBuilder('game_result')
      .update(GameResults)
      .set(paramUpdate)
      .where('id = :id', { id: resultId })
      .execute();

    if (updatedMemoryGameResult?.affected === 1) return paramUpdate;
  }

  async getGameResult(resultId: number) {
    const gameResult: GameResults = await this.gameResultRepository.findOne({
      where: {
        id: resultId,
      },
      select: [
        'id',
        'completeQuestion',
        'completeTime',
        'currentQuestionLevel',
        'score',
        'status',
        'createdAt',
        'updatedAt',
      ],
      relations: ['assessment', 'game', 'candidate'],
    });

    if (!gameResult)
      throw new CustomizeException(this.i18n.t('message.RESULT_NOT_FOUND'));

    return gameResult;
  }

  private getTimePlay(completeTime: number, createdAt: Date, updatedAt: Date) {
    const currentTime = new Date();
    let time: number = completeTime;

    if (completeTime === 0) {
      time = (currentTime.getTime() - createdAt.getTime()) / 1000;
    }

    if (completeTime !== 0) {
      time += (currentTime.getTime() - updatedAt.getTime()) / 1000;
    }

    return time;
  }

  async validateGameResult(resultId: number) {
    const result = await this.getGameResult(resultId);

    if (
      result.completeTime === 90 ||
      result.status === GameResultStatusEnum.COMPLETED
    ) {
      return {
        status: false,
        message: 'Game Finished',
      };
    }

    return { status: true };
  }

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

    if (!assessment) return false;

    if (assessment?.archive === 1) {
      throw new CustomizeException(this.i18n.t('message.ASSESSMENT_ARCHIVED'));
    }

    return true;
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

    const existedGameResult: GameResults =
      await this.gameResultRepository.findOne({
        where: {
          candidateId: params.candidateId,
          gameId: params.gameId,
          assessmentId: params.assessmentId,
        },
      });

    if (existedGameResult?.status === GameResultStatusEnum.NOT_COMPLETED) {
      return existedGameResult;
    }

    if (existedGameResult?.status === GameResultStatusEnum.COMPLETED) {
      // Game completed, throw exception
      throw new CustomizeException(this.i18n.t('message.GAME_PLAY_ONCE'));
    }

    // check start time to play game
    const currentTime = new Date();
    const assessment = await this.assessmentsRepository.findOne({
      where: {
        id: params.assessmentId,
      },
    });

    const startTime = assessment.startTime;

    if (startTime.getTime() > currentTime.getTime()) {
      throw new CustomizeException(this.i18n.t('message.ASSESSMENT_NOT_START'));
    }

    const paramCreate: CreateInitialGameResultInterface = plainToClass(
      GameResults,
      {
        assessmentId: params.assessmentId,
        gameId: params.gameId,
        candidateId: params.candidateId,
        status: GameResultStatusEnum.NOT_COMPLETED,
        currentQuestionLevel: 1,
      },
    );

    const gameResult = await this.gameResultRepository.save(paramCreate);

    return gameResult;
  }

  async findNextQuestion(resultId: number) {
    const nextLogicalAnswer = await this.logicalAnswerRepository
      .createQueryBuilder('logical_answer')
      .where('logical_answer.resultId = :resultId', { resultId })
      .andWhere('logical_answer.status = :status', {
        status: AnswerStatusEnum.NOT_DONE,
      })
      .orderBy('logical_answer.id', 'ASC')
      .getOne();

    if (nextLogicalAnswer) {
      const nextQuestion = await this.logicalQuestionRepository.findOne({
        where: {
          id: nextLogicalAnswer.questionId,
        },
        select: ['id', 'firstStatement', 'secondStatement', 'conclusion'],
      });
      return nextQuestion;
    }

    return null;
  }

  async continueLogicalGame(params: ContinueGameResultInterface) {
    const gameResult = await this.gameResultRepository.findOne({
      where: {
        assessmentId: params.assessmentId,
        gameId: params.gameId,
        candidateId: params.candidateId,
      },
    });

    const resultId = gameResult.id;

    if (!gameResult)
      throw new CustomizeException(this.i18n.t('message.RESULT_NOT_FOUND'));

    const paramUpdate = plainToClass(GameResults, {
      updatedAt: new Date(),
    });

    const updatedGameResult = await this.gameResultRepository.update(
      resultId,
      paramUpdate,
    );

    if (updatedGameResult.affected === 1) {
      return await this.findNextQuestion(resultId);
    }

    throw new CustomizeException('Can not continue this logical game');
  }

  async updateGameResultStatus(resultId: number) {
    const paramUpdate = plainToClass(GameResults, {
      status: GameResultStatusEnum.COMPLETED,
    });

    await this.gameResultRepository.update(resultId, paramUpdate);
  }

  async getAllResults() {
    const allResults = await this.gameResultRepository.find({});

    if (allResults.length === 0) {
      throw new CustomizeException('There are not any game results');
    }

    return allResults;
  }

  async completeGame(resultId: number) {
    const result = await this.getGameResult(resultId);

    const paramUpdate = plainToClass(GameResults, {
      status: GameResultStatusEnum.COMPLETED,
      completeTime: 90,
      currentQuestionLevel: result.currentQuestionLevel,
      completeQuestion: result.completeQuestion,
      score: result.score,
    });

    const updatedGameResult = await this.gameResultRepository.update(
      resultId,
      paramUpdate,
    );

    if (updatedGameResult.affected === 1) {
      return paramUpdate;
    }

    throw new CustomizeException('Update game result failed');
  }

  async isLastLogicalQuestion(resultId: number) {
    const result = await this.getGameResult(resultId);

    if (result.currentQuestionLevel < 20) return false;
    return true;
  }

  async saveInitialLogicalAnswers(
    newGameResult: GameResults,
    listRandomLogicalQuestions: LogicalQuestions[],
  ) {
    for (const randomQuestion of listRandomLogicalQuestions) {
      const initialLogicalAnswer = {
        resultId: newGameResult.id,
        questionId: randomQuestion.id,
        status: AnswerStatusEnum.NOT_DONE,
      };

      await this.logicalAnswerService.createInitialLogicalAnswer(
        initialLogicalAnswer,
      );
    }
  }
}
