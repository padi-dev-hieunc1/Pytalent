import { CustomizeException } from '@exception/customize.exception';
import { AnswerStatusEnum } from '@common/enum/answer-status.enum';
import { LogicalAnswersService } from '../services/logical-answer.service';

describe('LogicalAnswersService', () => {
  describe('#createInitialLogicalAnswer()', () => {
    const table = [
      {
        params: {
          resultId: 1,
          questionId: 1,
        },
        expected: {
          id: 1,
          candidateAnswer: null,
          isCorrect: 0,
          status: AnswerStatusEnum.NOT_DONE,
          resultId: 1,
          questionId: 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      },
      {
        params: {
          resultId: 1,
          questionId: 2,
        },
        expected: {
          id: 2,
          candidateAnswer: null,
          isCorrect: 0,
          status: AnswerStatusEnum.NOT_DONE,
          resultId: 1,
          questionId: 2,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      },
    ];

    test.each(table)('params: $params', async ({ params, expected }) => {
      const logicalAnswerRepository = {
        save: jest.fn().mockResolvedValueOnce(expected),
      };

      const service = new LogicalAnswersService(
        logicalAnswerRepository as any,
        {} as any,
        {} as any,
      );

      const result = await service.createInitialLogicalAnswer(params);

      expect(logicalAnswerRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          questionId: params.questionId,
          resultId: params.resultId,
          status: AnswerStatusEnum.NOT_DONE,
        }),
      );

      expect(result).toEqual(expected);
    });
  });

  describe('#isLogicalAnswerCorrect', () => {
    const table = [
      {
        questionId: 1,
        params: {
          candidateAnswer: 'Yes',
        },
        logicalQuestion: {
          result: 'Yes',
        },
        expected: {
          checkResult: true,
        },
      },
      {
        questionId: 2,
        params: {
          candidateAnswer: 'No',
        },
        logicalQuestion: {
          result: 'Yes',
        },
        expected: {
          checkResult: false,
        },
      },
    ];

    test.each(table)(
      'questionId: $questionId, params: $params',
      async ({ questionId, params, logicalQuestion, expected }) => {
        const logicalQuestionRepository = {
          findOne: jest.fn().mockResolvedValue(logicalQuestion),
        };

        const service = new LogicalAnswersService(
          {} as any,
          logicalQuestionRepository as any,
          {} as any,
        );

        const result = await service.isLogicalAnswerCorrect(questionId, params);

        expect(logicalQuestionRepository.findOne).toHaveBeenCalledWith({
          where: { id: questionId },
        });

        expect(result).toEqual(expected);
      },
    );
  });

  describe('#saveLogicalAnswer', () => {
    const table = [
      {
        resultId: 1,
        questionId: 1,
        params: {
          candidateAnswer: 'Yes',
        },
        checkResult: true,
        initialLogicalAnswer: {
          id: 1,
          candidateAnswer: null,
          isCorrect: 0,
          status: AnswerStatusEnum.NOT_DONE,
          resultId: 1,
          questionId: 1,
        },
        expected: {
          candidateAnswer: 'Yes',
          isCorrect: true,
          status: AnswerStatusEnum.DONE,
        },
      },
      {
        resultId: 1,
        questionId: 2,
        params: {
          candidateAnswer: 'No',
        },
        checkResult: false, // Updated to match the test case
        initialLogicalAnswer: {
          id: 2,
          candidateAnswer: null,
          isCorrect: 0,
          status: AnswerStatusEnum.NOT_DONE,
          resultId: 1,
          questionId: 2,
        },
        expected: {
          candidateAnswer: 'No',
          isCorrect: false,
          status: AnswerStatusEnum.DONE,
        },
      },
    ];

    test.each(table)(
      'resultId: $resultId, questionId: $questionId, params: $params, checkResult: $checkResult',
      async ({
        resultId,
        questionId,
        params,
        checkResult,
        initialLogicalAnswer,
        expected,
      }) => {
        const logicalAnswerRepository = {
          update: jest.fn(),
        };

        const service = new LogicalAnswersService(
          logicalAnswerRepository as any,
          {} as any,
          {} as any,
        );

        service.getLogicalAnswer = jest
          .fn()
          .mockResolvedValue(initialLogicalAnswer);

        await service.saveLogicalAnswer(
          resultId,
          questionId,
          params,
          checkResult,
        );

        expect(service.getLogicalAnswer).toHaveBeenCalledWith(
          questionId,
          resultId,
        );

        expect(logicalAnswerRepository.update).toHaveBeenCalledWith(
          initialLogicalAnswer.id,
          expect.objectContaining(expected),
        );
      },
    );
  });

  describe('#getLogicalQuestion', () => {
    const table = [
      {
        questionId: 1,
        found: true,
        expected: {
          id: 1,
          title: 'title',
          firstStatement: 'Statement 1',
          secondStatement: 'Statement 2',
          conclusion: 'Conclusion',
          score: 1,
          result: 'Yes',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      },
      {
        questionId: 2,
        found: false,
        expected: null,
      },
    ];

    test.each(table)(
      'questionId: $questionId',
      async ({ questionId, found, expected }) => {
        const logicalQuestionRepository = {
          findOne: jest.fn().mockResolvedValue(found ? expected : null),
        };

        const i18nMock = {
          t: jest.fn().mockReturnValue('message.LOGICAL_QUESTION_NOT_FOUND'),
        };

        const service = new LogicalAnswersService(
          {} as any,
          logicalQuestionRepository as any,
          i18nMock as any,
        );

        if (!found) {
          await expect(service.getLogicalQuestion(questionId)).rejects.toThrow(
            'message.LOGICAL_QUESTION_NOT_FOUND',
          );
        }

        if (found) {
          const result = await service.getLogicalQuestion(questionId);

          expect(logicalQuestionRepository.findOne).toHaveBeenCalledWith({
            where: { id: questionId },
          });

          expect(result).toEqual(expected);
        }
      },
    );
  });

  describe('#getLogicalAnswer', () => {
    const table = [
      {
        questionId: 1,
        resultId: 1,
        logicalAnswer: null,
        expectedException: 'message.LOGICAL_ANSWER_NOT_FOUND',
      },
      {
        questionId: 2,
        resultId: 2,
        logicalAnswer: { id: 1, candidateAnswer: 'Yes' },
        expectedException: 'message.LOGICAL_ANSWER_DONE',
      },
      {
        questionId: 3,
        resultId: 3,
        logicalAnswer: { id: 2, candidateAnswer: null },
        expected: { id: 2, candidateAnswer: null },
      },
    ];

    test.each(table)(
      'questionId: $questionId, resultId: $resultId',
      async ({
        questionId,
        resultId,
        logicalAnswer,
        expectedException,
        expected,
      }) => {
        const logicalAnswerRepository = {
          findOne: jest.fn().mockResolvedValue(logicalAnswer),
        };

        const i18nMock = {
          t: jest.fn().mockImplementation((key) => key),
        };

        const service = new LogicalAnswersService(
          logicalAnswerRepository as any,
          {} as any,
          i18nMock as any,
        );

        if (expectedException) {
          await expect(
            service.getLogicalAnswer(questionId, resultId),
          ).rejects.toThrow(new CustomizeException(expectedException));
        } else {
          const result = await service.getLogicalAnswer(questionId, resultId);

          expect(logicalAnswerRepository.findOne).toHaveBeenCalledWith({
            where: { questionId, resultId },
          });
          expect(result).toEqual(expected);
        }
      },
    );
  });
});
