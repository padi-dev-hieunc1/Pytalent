import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';
import { CustomizeException } from '@exception/customize.exception';
import { LogicalAnswers } from '@entities/logical-answers.entity';
import {
  AnswerLogicalQuestionInterface,
  CreateInitialLogicalAnswerInterface,
} from '@shared/interfaces/answer.interface';
import { AnswerStatusEnum } from '@common/enum/answer-status.enum';
import { LogicalAnswersRepository } from '../repositories/logical-answer.repository';
import { LogicalQuestionsRepository } from '@modules/logical-questions/repositories/logical-question.repository';
import { GameResultsService } from './result.service';
import { GameResultStatusEnum } from '@common/enum/game-result-status.enum';

@Injectable()
export class LogicalAnswersService {
  constructor(
    private logicalAnswerRepository: LogicalAnswersRepository,
    private logicalQuestionRepository: LogicalQuestionsRepository,
    private gameResultService: GameResultsService,
    private readonly i18n: I18nService,
  ) {}
  async createInitialLogicalAnswer(
    params: CreateInitialLogicalAnswerInterface,
  ) {
    const paramCreate: CreateInitialLogicalAnswerInterface = plainToClass(
      LogicalAnswers,
      {
        questionId: params.questionId,
        resultId: params.resultId,
        status: AnswerStatusEnum.NOT_DONE,
      },
    );

    const initialLogicalAnswer = await this.logicalAnswerRepository.save(
      paramCreate,
    );

    return initialLogicalAnswer;
  }

  async answerLogicalQuestion(
    resultId: number,
    questionId: number,
    params: AnswerLogicalQuestionInterface,
  ) {
    const [result, logicalAnswer, question] = await Promise.all([
      this.gameResultService.getDetailGameResult(resultId),
      this.logicalAnswerRepository.findOne({
        where: {
          questionId: questionId,
          resultId: resultId,
        },
      }),
      this.logicalQuestionRepository.findOne({
        where: {
          id: questionId,
        },
      }),
    ]);

    if (!question)
      throw new CustomizeException(
        this.i18n.t('message.LOGICAL_QUESTION_NOT_FOUND'),
      );

    if (!logicalAnswer)
      throw new CustomizeException(
        this.i18n.t('message.LOGICAL_ANSWER_NOT_FOUND'),
      );

    if (logicalAnswer.candidateAnswer)
      throw new CustomizeException(this.i18n.t('message.LOGICAL_ANSWER_DONE'));

    if (
      result.completeTime <= 90 &&
      result.status === GameResultStatusEnum.NOT_COMPLETED
    ) {
      const check_correct = params.candidate_answer === question.result ? 1 : 0;
      const answer_status = params.candidate_answer
        ? AnswerStatusEnum.DONE
        : AnswerStatusEnum.SKIP;

      const paramUpdate = plainToClass(LogicalAnswers, {
        candidate_answer: params.candidate_answer,
        is_correct: check_correct,
        status: answer_status,
      });

      await this.logicalAnswerRepository.update(logicalAnswer.id, paramUpdate);

      return paramUpdate;
    }
    return null;
  }

  async getDetailLogicalAnswer(resultId: number, questionId: number) {
    const logicalAnswer = await this.logicalAnswerRepository.findOne({
      where: {
        resultId: resultId,
        questionId: questionId,
      },
    });

    if (logicalAnswer) return logicalAnswer;
    else
      throw new CustomizeException(
        this.i18n.t('message.LOGICAL_ANSWER_NOT_FOUND'),
      );
  }
}
