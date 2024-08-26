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
  async createMemoryAnswer(resultId: number, level: number) {
    const game_result = await this.gameResultService.getDetailGameResult(
      resultId,
    );

    if (game_result.assessment.archive === 1) {
      throw new CustomizeException(this.i18n.t('message.ASSESSMENT_ARCHIVED'));
    }

    const memory_answer = await this.getDetailMemoryAnswer(resultId, level);

    if (!memory_answer) {
      const random_title = this.randomMemoryTitle(level);
      const paramCreate = plainToClass(MemoryAnswers, {
        resultId: resultId,
        title: random_title,
        status: AnswerStatusEnum.NOT_DONE,
        level: level,
        time_limit: level > 3 ? level : 3,
      });

      const initial_memory_answer = await this.memoryAnswerRepository.save(
        paramCreate,
      );

      return initial_memory_answer;
    }
  }

  randomMemoryTitle(level: number) {
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
    const memory_answer: MemoryAnswers =
      await this.memoryAnswerRepository.findOne({
        where: {
          resultId: resultId,
          level: level,
        },
      });

    if (memory_answer) return memory_answer;
  }

  async updateMemoryAnswer(
    resultId: number,
    level: number,
    updateMemoryAnswer: MemoryAnswerInterface,
  ) {
    const memory_answer = await this.getDetailMemoryAnswer(resultId, level);

    const title_patterns = memory_answer.title.split(' ');
    const title_len = title_patterns.length;
    const candidate_patterns = updateMemoryAnswer.candidate_answer.split(' ');
    const len = candidate_patterns.length;

    // Compare elements of 2 above arrays
    if (candidate_patterns[len - 1] !== title_patterns[len - 1]) {
      const paramUpdate = plainToClass(MemoryAnswers, {
        candidate_answer: updateMemoryAnswer.candidate_answer,
        is_correct: 0,
        status: AnswerStatusEnum.DONE,
      });

      await this.memoryAnswerRepository.update(memory_answer.id, paramUpdate);

      await this.gameResultService.updateGameResultStatus(resultId);
    } else if (
      candidate_patterns[len - 1] === title_patterns[len - 1] &&
      len < title_len
    ) {
      const paramUpdate = plainToClass(MemoryAnswers, {
        candidate_answer: updateMemoryAnswer.candidate_answer,
        is_correct: 0,
        status: AnswerStatusEnum.NOT_DONE,
      });

      await this.memoryAnswerRepository.update(memory_answer.id, paramUpdate);
    } else {
      const paramUpdate = plainToClass(MemoryAnswers, {
        candidate_answer: updateMemoryAnswer.candidate_answer,
        is_correct: 1,
        status: AnswerStatusEnum.DONE,
      });

      await this.memoryAnswerRepository.update(memory_answer.id, paramUpdate);
    }

    const updated_memory_answer = await this.getDetailMemoryAnswer(
      resultId,
      level,
    );

    return updated_memory_answer;
  }

  async continueMemoryGame(params: ContinueGameResultInterface) {
    const game_result = await this.gameResultRepository.findOne({
      where: {
        assessmentId: params.assessmentId,
        gameId: params.gameId,
        candidateId: params.candidateId,
      },
    });

    const resultId = game_result.id;
    const current_level = game_result.currentQuestionLevel;

    if (game_result) {
      const paramUpdate = plainToClass(GameResults, {
        updatedAt: new Date(),
      });

      const updated_game_result = await this.gameResultRepository.update(
        resultId,
        paramUpdate,
      );

      if (updated_game_result.affected === 1) {
        const next_level = await this.getDetailMemoryAnswer(
          resultId,
          current_level,
        );

        return next_level;
      } else {
        return null;
      }
    } else {
      throw new CustomizeException(this.i18n.t('message.RESULT_NOT_FOUND'));
    }
  }
}
