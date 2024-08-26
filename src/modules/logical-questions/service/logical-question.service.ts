import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';
import { LogicalQuestionsRepository } from '../repositories/logical-question.repository';
import { CreateLogicalQuestionInterface } from '@shared/interfaces/logical-question.interface';
import { LogicalQuestions } from '@entities/logical-questions.entity';
import { CustomizeException } from '@exception/customize.exception';
import { UpdateLogicalQuestionScoreDto } from '../dto/update-logical-question-score.dto';

@Injectable()
export class LogicalQuestionsService {
  constructor(
    private logicalQuestionRepository: LogicalQuestionsRepository,
    private readonly i18n: I18nService,
  ) {}

  async createLogicalQuestion(params: CreateLogicalQuestionInterface) {
    const paramCreate: CreateLogicalQuestionInterface = plainToClass(
      LogicalQuestions,
      {
        title: params.title,
        firstStatement: params.firstStatement,
        secondStatement: params.secondStatement,
        conclusion: params.conclusion,
        score: params.score,
        result: params.result,
      },
    );

    const logical_question = await this.logicalQuestionRepository.save(
      paramCreate,
    );

    return logical_question;
  }

  async randomLogicalQuestions(): Promise<LogicalQuestions[]> {
    const yesQuestions = await this.logicalQuestionRepository
      .createQueryBuilder('question')
      .select([
        'question.id',
        'question.firstStatement',
        'question.secondStatement',
        'question.conclusion',
      ])
      .distinct(true)
      .where('question.result = :result', { result: 'Yes' })
      .orderBy('RAND()')
      .take(10)
      .getMany();

    const noQuestions = await this.logicalQuestionRepository
      .createQueryBuilder('question')
      .select([
        'question.id',
        'question.firstStatement',
        'question.secondStatement',
        'question.conclusion',
      ])
      .distinct(true)
      .where('question.result = :result', { result: 'No' })
      .orderBy('RAND()')
      .take(10)
      .getMany();

    const shuffledLogicalQuestions: LogicalQuestions[] = [];
    let consecutiveYesCount = 0;
    let consecutiveNoCount = 0;
    let remainYesCount = 10;
    let remainNoCount = 10;

    // Cứ sau 3 câu Yes(No) thì sau nó phải là ít nhất 2 câu No (Yes)
    while (yesQuestions.length > 0 || noQuestions.length > 0) {
      let selectedQuestion1: LogicalQuestions | undefined;
      let selectedQuestion2: LogicalQuestions | undefined;

      const result = Math.random() < 0.5 ? 'Yes' : 'No';

      if (remainNoCount == 0 && remainYesCount >= 3) {
        this.randomLogicalQuestions();
      }

      if (remainYesCount == 0 && remainNoCount >= 3) {
        this.randomLogicalQuestions();
      }

      if (consecutiveYesCount === 3) {
        selectedQuestion1 = noQuestions.pop();
        selectedQuestion2 = noQuestions.pop();
        shuffledLogicalQuestions.push(selectedQuestion1, selectedQuestion2);
        consecutiveNoCount += 2;
        remainNoCount -= 2;
        consecutiveYesCount = 0; // Reset consecutiveYesCount
      } else if (consecutiveNoCount === 3) {
        selectedQuestion1 = yesQuestions.pop();
        selectedQuestion2 = yesQuestions.pop();
        shuffledLogicalQuestions.push(selectedQuestion1, selectedQuestion2);
        consecutiveYesCount += 2;
        remainYesCount -= 2;
        consecutiveNoCount = 0; // Reset consecutiveNoCount
      } else {
        if (result === 'Yes') {
          selectedQuestion1 = yesQuestions.pop();
          shuffledLogicalQuestions.push(selectedQuestion1);
          consecutiveYesCount++;
          remainYesCount -= 1;
          consecutiveNoCount = 0; // Reset consecutiveNoCount
        } else if (result === 'No') {
          selectedQuestion1 = noQuestions.pop();
          shuffledLogicalQuestions.push(selectedQuestion1);
          consecutiveNoCount++;
          remainNoCount -= 1;
          consecutiveYesCount = 0; // Reset consecutiveNoCount
        }
      }
    }

    const filteredShuffledLogicalQuestions = shuffledLogicalQuestions.filter(
      (logicalQuestion) => logicalQuestion !== undefined,
    );

    return filteredShuffledLogicalQuestions;
  }

  async getDetailLogicalQuestion(questionId: number) {
    const logical_question = await this.logicalQuestionRepository.findOne({
      where: {
        id: questionId,
      },
      select: ['id', 'firstStatement', 'secondStatement', 'conclusion'],
    });

    if (logical_question) return logical_question;
    else
      throw new CustomizeException(
        this.i18n.t('message.LOGICAL_QUESTION_NOT_FOUND'),
      );
  }

  async deleteLogicalQuestion(questionId: number) {
    const logical_question = await this.logicalQuestionRepository.findOne({
      where: {
        id: questionId,
      },
    });

    if (logical_question) {
      return await this.logicalQuestionRepository
        .createQueryBuilder()
        .delete()
        .from(LogicalQuestions)
        .where('id = :id', { id: questionId })
        .execute();
    } else
      throw new CustomizeException(
        this.i18n.t('message.LOGICAL_QUESTION_NOT_FOUND'),
      );
  }

  async updateLogicalQuestionScore(
    questionId: number,
    updateLogicalQuestionScore: UpdateLogicalQuestionScoreDto,
  ) {
    const logical_question = await this.logicalQuestionRepository.findOne({
      where: {
        id: questionId,
      },
    });

    if (logical_question) {
      const paramUpdate = plainToClass(LogicalQuestions, {
        score: updateLogicalQuestionScore.score,
      });

      return await this.logicalQuestionRepository.update(
        questionId,
        paramUpdate,
      );
    } else {
      throw new CustomizeException(
        this.i18n.t('message.LOGICAL_QUESTION_NOT_FOUND'),
      );
    }
  }
}
