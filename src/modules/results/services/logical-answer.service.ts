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

@Injectable()
export class LogicalAnswersService {
  constructor(
    private logicalAnswerRepository: LogicalAnswersRepository,
    private logicalQuestionRepository: LogicalQuestionsRepository,
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

  async isLogicalAnswerCorrect(
    questionId: number,
    params: AnswerLogicalQuestionInterface,
  ) {
    const logicalQuestion = await this.getLogicalQuestion(questionId);

    const checkCorrect =
      params.candidateAnswer === logicalQuestion.result ? 1 : 0;

    if (checkCorrect) {
      return {
        checkResult: true,
      };
    }

    return {
      checkResult: false,
    };
  }

  async saveLogicalAnswer(
    resultId: number,
    questionId: number,
    params: AnswerLogicalQuestionInterface,
    checkResult: boolean,
  ) {
    const initialLogicalAnswer = await this.getLogicalAnswer(
      questionId,
      resultId,
    );

    const answerStatus = params.candidateAnswer
      ? AnswerStatusEnum.DONE
      : AnswerStatusEnum.SKIP;

    const paramUpdate = plainToClass(LogicalAnswers, {
      candidateAnswer: params.candidateAnswer,
      isCorrect: checkResult,
      status: answerStatus,
    });

    await this.logicalAnswerRepository.update(
      initialLogicalAnswer.id,
      paramUpdate,
    );
  }

  async getLogicalQuestion(questionId: number) {
    const logicalQuestion = await this.logicalQuestionRepository.findOne({
      where: {
        id: questionId,
      },
    });

    if (!logicalQuestion)
      throw new CustomizeException(
        this.i18n.t('message.LOGICAL_QUESTION_NOT_FOUND'),
      );

    return logicalQuestion;
  }

  async getLogicalAnswer(questionId: number, resultId: number) {
    const logicalAnswer = await this.logicalAnswerRepository.findOne({
      where: {
        questionId: questionId,
        resultId: resultId,
      },
    });

    if (!logicalAnswer)
      throw new CustomizeException(
        this.i18n.t('message.LOGICAL_ANSWER_NOT_FOUND'),
      );

    if (logicalAnswer.candidateAnswer)
      throw new CustomizeException(this.i18n.t('message.LOGICAL_ANSWER_DONE'));

    return logicalAnswer;
  }
}
