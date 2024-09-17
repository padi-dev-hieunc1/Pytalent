import { CustomizeException } from '@exception/customize.exception';
import { GameResultsService } from '../services/result.service';
import { RoleEnum } from '@common/enum/role.enum';
import { GameResultStatusEnum } from '@common/enum/game-result-status.enum';
import { AnswerStatusEnum } from '@common/enum/answer-status.enum';

describe('GameResultsService', () => {
  describe('#updateLogicalGameResult', () => {
    const table = [
      {
        resultId: 1,
        checkAnswer: true,
        existingGameResult: {
          completeTime: 30,
          createdAt: new Date(
            ((new Date().getTime() - 1000 * 60) / 1000) * 1000,
          ),
          updatedAt: new Date(
            (Math.floor(new Date().getTime() - 1000 * 30) / 1000) * 1000,
          ),
          currentQuestionLevel: 2,
          completeQuestion: 1,
          score: 2,
        },
        expected: {
          status: GameResultStatusEnum.NOT_COMPLETED,
          currentQuestionLevel: 3,
          completeQuestion: 2,
          score: 3,
          completeTime: 60,
          updatedAt: new Date(Math.floor(new Date().getTime() / 1000) * 1000),
        },
      },
      {
        resultId: 2,
        checkAnswer: false,
        existingGameResult: {
          completeTime: 0,
          createdAt: new Date(
            ((new Date().getTime() - 1000 * 30) / 1000) * 1000,
          ),
          updatedAt: new Date(
            (Math.floor(new Date().getTime() - 1000 * 30) / 1000) * 1000,
          ),
          currentQuestionLevel: 1,
          completeQuestion: 0,
          score: 0,
        },
        expected: {
          status: GameResultStatusEnum.NOT_COMPLETED,
          currentQuestionLevel: 2,
          completeQuestion: 1,
          score: 0,
          completeTime: 30,
          updatedAt: new Date(Math.floor(new Date().getTime() / 1000) * 1000),
        },
      },
    ];

    test.each(table)(
      'resultId: $resultId, checkAnswer: $checkAnswer',
      async ({ resultId, checkAnswer, existingGameResult, expected }) => {
        const gameResultRepository = {
          findOne: jest.fn().mockResolvedValue(existingGameResult),
          createQueryBuilder: jest.fn(() => ({
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValue({ affected: 1 }),
          })),
        };

        const i18nMock = {
          t: jest.fn().mockImplementation((key) => key),
        };

        const service = new GameResultsService(
          gameResultRepository as any,
          {} as any,
          {} as any,
          {} as any,
          {} as any,
          {} as any,
          {} as any,
          i18nMock as any,
        );

        const result = await service.updateLogicalGameResult(
          resultId,
          checkAnswer,
        );

        expect(gameResultRepository.findOne).toHaveBeenCalledWith({
          where: { id: resultId },
          relations: ['assessment', 'game', 'candidate'],
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
        });

        const finalResult = {
          ...result,
          completeTime: Math.round(result.completeTime),
        };

        expect(finalResult).toEqual(expected);
      },
    );
  });

  describe('#getGameResult', () => {
    const table = [
      {
        resultId: 1,
        expected: {
          id: 1,
          completeQuestion: 5,
          completeTime: 90,
          currentQuestionLevel: 6,
          score: 5,
          status: GameResultStatusEnum.COMPLETED,
        },
        found: true,
      },
      {
        resultId: 2,
        expected: null,
        found: false,
      },
    ];

    test.each(table)(
      'resultId: $resultId',
      async ({ resultId, found, expected }) => {
        const mockGameResultRepository = {
          findOne: jest.fn().mockResolvedValue(expected),
        };

        const i18nMock = {
          t: jest.fn().mockImplementation((key) => key),
        };

        const service = new GameResultsService(
          mockGameResultRepository as any,
          {} as any,
          {} as any,
          {} as any,
          {} as any,
          {} as any,
          {} as any,
          i18nMock as any,
        );

        if (!found) {
          await expect(service.getGameResult(resultId)).rejects.toThrow(
            new CustomizeException('message.RESULT_NOT_FOUND'),
          );
        }

        if (found) {
          const result = await service.getGameResult(resultId);
          expect(result).toEqual(expected);
        }
      },
    );
  });

  describe('#validateGameResult', () => {
    const table = [
      {
        resultId: 1,
        result: {
          id: 1,
          completeTime: 90,
          status: GameResultStatusEnum.COMPLETED,
          completeQuestion: 14,
          score: 10,
          currentQuestionLevel: 15,
        },
        expected: { status: false, message: 'Game Finished' },
      },
      {
        resultId: 2,
        result: {
          id: 2,
          completeTime: 45,
          status: GameResultStatusEnum.NOT_COMPLETED,
          completeQuestion: 17,
          score: 15,
          currentQuestionLevel: 18,
        },
        expected: { status: true },
      },
    ];

    test.each(table)(
      'resultId: $resultId',
      async ({ resultId, result, expected }) => {
        const service = new GameResultsService(
          {} as any,
          {} as any,
          {} as any,
          {} as any,
          {} as any,
          {} as any,
          {} as any,
          {} as any,
        );

        jest.spyOn(service, 'getGameResult').mockResolvedValue(result as any);

        const response = await service.validateGameResult(resultId);

        expect(service.getGameResult).toHaveBeenCalledWith(resultId);
        expect(response).toEqual(expected);
      },
    );
  });

  describe('#checkExistedCandidate', () => {
    const table = [
      {
        candidateId: 1,
        expected: true,
      },
      {
        candidateId: 2,
        expected: false,
      },
    ];

    test.each(table)(
      'candidateId: $candidateId',
      async ({ candidateId, expected }) => {
        const usersRepository = {
          findOne: jest
            .fn()
            .mockResolvedValue(
              expected ? { id: candidateId, role: RoleEnum.CANDIDATE } : null,
            ),
        };

        const service = new GameResultsService(
          {} as any,
          usersRepository as any,
          {} as any,
          {} as any,
          {} as any,
          {} as any,
          {} as any,
          {} as any,
        );

        const result = await service.checkExistedCandidate(candidateId);

        expect(usersRepository.findOne).toHaveBeenCalledWith({
          where: { id: candidateId, role: RoleEnum.CANDIDATE },
        });

        expect(result).toEqual(expected);
      },
    );
  });

  describe('#checkExistedGame', () => {
    const table = [
      {
        gameId: 1,
        expected: true,
      },
      {
        gameId: 2,
        expected: false,
      },
    ];

    test.each(table)('gameId: $gameId', async ({ gameId, expected }) => {
      const gamesRepository = {
        findOne: jest.fn().mockResolvedValue(expected ? { id: gameId } : null),
      };

      const service = new GameResultsService(
        {} as any,
        {} as any,
        {} as any,
        gamesRepository as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
      );

      const result = await service.checkExistedGame(gameId);

      expect(gamesRepository.findOne).toHaveBeenCalledWith({
        where: { id: gameId },
      });

      expect(result).toEqual(expected);
    });
  });

  describe('#checkExistedAssessment', () => {
    const table = [
      {
        assessmentId: 1,
        expected: true,
      },
      {
        assessmentId: 2,
        expected: false,
      },
    ];

    test.each(table)(
      'assessmentId: $assessmentId',
      async ({ assessmentId, expected }) => {
        const assessmentRepository = {
          findOne: jest
            .fn()
            .mockResolvedValue(expected ? { id: assessmentId } : null),
        };

        const service = new GameResultsService(
          {} as any,
          {} as any,
          assessmentRepository as any,
          {} as any,
          {} as any,
          {} as any,
          {} as any,
          {} as any,
        );

        const result = await service.checkExistedAssessment(assessmentId);

        expect(assessmentRepository.findOne).toHaveBeenCalledWith({
          where: { id: assessmentId },
        });

        expect(result).toEqual(expected);
      },
    );
  });

  describe('#isLastLogicalQuestion', () => {
    const table = [
      {
        resultId: 1,
        result: { currentQuestionLevel: 15 },
        expected: false,
      },
      {
        resultId: 2,
        result: { currentQuestionLevel: 20 },
        expected: true,
      },
    ];

    test.each(table)(
      'resultId: $resultId',
      async ({ resultId, result, expected }) => {
        const service = new GameResultsService(
          {} as any,
          {} as any,
          {} as any,
          {} as any,
          {} as any,
          {} as any,
          {} as any,
          {} as any,
        );

        jest.spyOn(service, 'getGameResult').mockResolvedValue(result as any);

        const response = await service.isLastLogicalQuestion(resultId);

        expect(service.getGameResult).toHaveBeenCalledWith(resultId);

        expect(response).toEqual(expected);
      },
    );
  });

  describe('#findNextQuestion', () => {
    const table = [
      {
        resultId: 1,
        nextLogicalAnswer: {
          id: 1,
          questionId: 1,
          status: AnswerStatusEnum.NOT_DONE,
        },
        expected: {
          id: 1,
          firstStatement: 'Statement 1',
          secondStatement: 'Statement 2',
          conclusion: 'Conclusion',
        },
      },
      {
        resultId: 2,
        nextLogicalAnswer: null,
        expected: null,
      },
    ];

    test.each(table)(
      'resultId: $resultId',
      async ({ resultId, nextLogicalAnswer, expected }) => {
        const mockCreateQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockResolvedValue(nextLogicalAnswer),
        };

        const logicalAnswerRepository = {
          createQueryBuilder: jest.fn(() => mockCreateQueryBuilder),
        };

        const logicalQuestionRepository = {
          findOne: jest.fn().mockResolvedValue(expected),
        };

        const service = new GameResultsService(
          {} as any,
          {} as any,
          {} as any,
          {} as any,
          logicalAnswerRepository as any,
          logicalQuestionRepository as any,
          {} as any,
          {} as any,
        );

        const result = await service.findNextQuestion(resultId);

        expect(logicalAnswerRepository.createQueryBuilder).toHaveBeenCalled();

        expect(mockCreateQueryBuilder.where).toHaveBeenCalledWith(
          'logical_answer.resultId = :resultId',
          { resultId },
        );

        expect(mockCreateQueryBuilder.andWhere).toHaveBeenCalledWith(
          'logical_answer.status = :status',
          { status: AnswerStatusEnum.NOT_DONE },
        );

        expect(mockCreateQueryBuilder.orderBy).toHaveBeenCalledWith(
          'logical_answer.id',
          'ASC',
        );

        if (!nextLogicalAnswer) {
          expect(logicalQuestionRepository.findOne).not.toHaveBeenCalled();
        } else {
          expect(logicalQuestionRepository.findOne).toHaveBeenCalledWith({
            where: { id: nextLogicalAnswer.questionId },
            select: ['id', 'firstStatement', 'secondStatement', 'conclusion'],
          });
        }

        expect(result).toEqual(expected);
      },
    );
  });

  describe('#getAllResults', () => {
    const table = [
      {
        allResults: [
          { id: 1, score: 10 },
          { id: 2, score: 20 },
        ],
        expected: [
          { id: 1, score: 10 },
          { id: 2, score: 20 },
        ],
      },
      {
        allResults: [],
        expected: null,
      },
    ];

    test.each(table)('', async ({ allResults, expected }) => {
      const gameResultRepository = {
        find: jest.fn().mockResolvedValue(allResults),
      };

      const service = new GameResultsService(
        gameResultRepository as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
      );

      if (!expected) {
        await expect(service.getAllResults()).rejects.toThrow(
          new CustomizeException('There are not any game results'),
        );
      } else {
        const result = await service.getAllResults();
        expect(result).toEqual(expected);
      }
    });
  });

  describe('#createGameResults', () => {
    //
  });

  describe('#updateMemoryGameResult', () => {
    //
  });

  describe('#continueLogicalGame', () => {
    //
  });

  describe('#completeGame', () => {
    //
  });

  describe('#saveInitialLogicalAnswers', () => {
    //
  });
});
