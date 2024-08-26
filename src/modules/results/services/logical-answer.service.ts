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

  async validateLogicalAnswer(
    resultId: number,
    questionId: number,
    params: AnswerLogicalQuestionInterface,
  ) {
    const logicalQuestion = await this.getLogicalQuestion(questionId);
    const initialLogicalAnswer = await this.getLogicalAnswer(
      questionId,
      resultId,
    );

    const checkCorrect =
      params.candidate_answer === logicalQuestion.result ? 1 : 0;
    const answerStatus = params.candidate_answer
      ? AnswerStatusEnum.DONE
      : AnswerStatusEnum.SKIP;

    const paramUpdate = plainToClass(LogicalAnswers, {
      candidateAnswer: params.candidate_answer,
      isCorrect: checkCorrect,
      status: answerStatus,
    });

    await this.logicalAnswerRepository.update(
      initialLogicalAnswer.id,
      paramUpdate,
    );

    if (checkCorrect) {
      return {
        checkResult: true,
      };
    }

    return {
      checkResult: false,
    };
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
