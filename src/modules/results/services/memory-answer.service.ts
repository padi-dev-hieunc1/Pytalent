import { Injectable } from '@nestjs/common';
import { MemoryAnswers } from '@entities/memory-answers.entity';
import { plainToClass } from 'class-transformer';
import { AnswerStatusEnum } from '@common/enum/answer-status.enum';
import { MemoryAnswersRepository } from '../repositories/memory-answer.repository';
import { MemoryAnswerInterface } from '@shared/interfaces/answer.interface';
import { GameResultsService } from './result.service';
import { ContinueGameResultInterface } from '@shared/interfaces/game-result.interface';
import { GameResults } from '@entities/games-results.entity';
import { CustomizeException } from '@exception/customize.exception';
import { GameResultsRepository } from '../repositories/result.repository';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class MemoryAnswersService {
  constructor(
    private memoryAnswerRepository: MemoryAnswersRepository,
    private gameResultService: GameResultsService,
    private gameResultRepository: GameResultsRepository,
    private readonly i18n: I18nService,
  ) {}
  async createRandomMemoryAnswer(resultId: number, level: number) {
    const gameResult = await this.gameResultService.getDetailGameResult(
      resultId,
    );

    if (gameResult.assessment.archive === 1) {
      throw new CustomizeException(this.i18n.t('message.ASSESSMENT_ARCHIVED'));
    }

    const memoryAnswer = await this.getDetailMemoryAnswer(resultId, level);

    if (!memoryAnswer) {
      const randomTitle = this.randomMemoryTitle(level);
      const paramCreate = plainToClass(MemoryAnswers, {
        resultId: resultId,
        title: randomTitle,
        status: AnswerStatusEnum.NOT_DONE,
        level: level,
        timeLimit: level > 3 ? level : 3,
      });

      const initialMemoryAnswer = await this.memoryAnswerRepository.save(
        paramCreate,
      );

      return initialMemoryAnswer;
    }
  }

  private randomMemoryTitle(level: number) {
    const words = ['left', 'right'];
    let title = '';

    for (let i = 0; i < level; i++) {
      const randomIndex = Math.floor(Math.random() * words.length);
      title += words[randomIndex];
      if (i < level - 1) {
        title += ' ';
      }
    }
    return title;
  }

  async getDetailMemoryAnswer(resultId: number, level: number) {
    const memoryAnswer: MemoryAnswers =
      await this.memoryAnswerRepository.findOne({
        where: {
          resultId: resultId,
          level: level,
        },
      });

    if (memoryAnswer) return memoryAnswer;
  }

  async updateMemoryAnswer(
    resultId: number,
    level: number,
    updateMemoryAnswer: MemoryAnswerInterface,
  ) {
    const memoryAnswer = await this.getDetailMemoryAnswer(resultId, level);

    const titlePatterns = memoryAnswer.title.split(' ');
    const titleLen = titlePatterns.length;
    const candidatePatterns = updateMemoryAnswer.candidateAnswer.split(' ');
    const len = candidatePatterns.length;

    // Compare elements of 2 above arrays
    if (candidatePatterns[len - 1] !== titlePatterns[len - 1]) {
      const paramUpdate = plainToClass(MemoryAnswers, {
        candidateAnswer: updateMemoryAnswer.candidateAnswer,
        isCorrect: 0,
        status: AnswerStatusEnum.DONE,
      });

      await this.memoryAnswerRepository.update(memoryAnswer.id, paramUpdate);

      await this.gameResultService.updateGameResultStatus(resultId);
    } else if (
      candidatePatterns[len - 1] === titlePatterns[len - 1] &&
      len < titleLen
    ) {
      const paramUpdate = plainToClass(MemoryAnswers, {
        candidateAnswer: updateMemoryAnswer.candidateAnswer,
        isCorrect: 0,
        status: AnswerStatusEnum.NOT_DONE,
      });

      await this.memoryAnswerRepository.update(memoryAnswer.id, paramUpdate);
    } else {
      const paramUpdate = plainToClass(MemoryAnswers, {
        candidateAnswer: updateMemoryAnswer.candidateAnswer,
        isCorrect: 1,
        status: AnswerStatusEnum.DONE,
      });

      await this.memoryAnswerRepository.update(memoryAnswer.id, paramUpdate);
    }

    const updatedMemoryAnswer = await this.getDetailMemoryAnswer(
      resultId,
      level,
    );

    return updatedMemoryAnswer;
  }

  async continueMemoryGame(params: ContinueGameResultInterface) {
    const gameResult = await this.gameResultRepository.findOne({
      where: {
        assessmentId: params.assessmentId,
        gameId: params.gameId,
        candidateId: params.candidateId,
      },
    });

    const resultId = gameResult.id;
    const currentLevel = gameResult.currentQuestionLevel;

    if (!gameResult) {
      throw new CustomizeException(this.i18n.t('message.RESULT_NOT_FOUND'));
    }

    const paramUpdate = plainToClass(GameResults, {
      updatedAt: new Date(),
    });

    const updatedGameResult = await this.gameResultRepository.update(
      resultId,
      paramUpdate,
    );

    if (updatedGameResult.affected === 1) {
      const nextLevel = await this.getDetailMemoryAnswer(
        resultId,
        currentLevel,
      );

      return nextLevel;
    }

    throw new CustomizeException('Can not continue this memory game');
  }
}
