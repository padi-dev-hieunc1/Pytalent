import { Test, TestingModule } from '@nestjs/testing';
import { LogicalAnswersService } from './logical-answer.service';
import { LogicalAnswersRepository } from '../repositories/logical-answer.repository';
import { LogicalQuestionsRepository } from '@modules/logical-questions/repositories/logical-question.repository';
import { GameResultsService } from './result.service';
import { I18nService } from 'nestjs-i18n';
import { CustomizeException } from '@exception/customize.exception';
import { AnswerStatusEnum } from '@common/enum/answer-status.enum';

describe('LogicalAnswersService unit', () => {
  let logicalAnswersService: LogicalAnswersService;

  const mockLogicalAnswersRepository = {
    save: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
  };

  const mockLogicalQuestionsRepository = {
    findOne: jest.fn(),
  };

  const mockGameResultsService = {};

  const mockI18nService = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogicalAnswersService,
        {
          provide: LogicalAnswersRepository,
          useValue: mockLogicalAnswersRepository,
        },
        {
          provide: LogicalQuestionsRepository,
          useValue: mockLogicalQuestionsRepository,
        },
        {
          provide: GameResultsService,
          useValue: mockGameResultsService,
        },
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
      ],
    }).compile();

    logicalAnswersService = module.get<LogicalAnswersService>(
      LogicalAnswersService,
    );
  });

  it('should be defined', () => {
    expect(logicalAnswersService).toBeDefined();
  });

  describe('createInitialLogicalAnswer', () => {
    it('should create and return the initial logical answer', async () => {
      const mockParams = { questionId: 1, resultId: 1 };
      const mockAnswer = { ...mockParams, status: AnswerStatusEnum.NOT_DONE };

      mockLogicalAnswersRepository.save.mockResolvedValueOnce(mockAnswer);

      const result = await logicalAnswersService.createInitialLogicalAnswer(
        mockAnswer,
      );

      expect(mockLogicalAnswersRepository.save).toHaveBeenCalledWith({
        questionId: mockParams.questionId,
        resultId: mockParams.resultId,
        status: AnswerStatusEnum.NOT_DONE,
      });

      expect(result).toEqual(mockAnswer);
    });
  });

  describe('validateLogicalAnswer', () => {
    it('should validate the logical answer correctly', async () => {
      const resultId = 1;
      const questionId = 1;
      const params = { candidateAnswer: 'Yes' };
      const mockLogicalQuestion = { id: questionId, result: 'Yes' };
      const mockLogicalAnswer = {
        id: 1,
        questionId,
        resultId,
        candidateAnswer: null,
      };

      mockLogicalQuestionsRepository.findOne.mockResolvedValueOnce(
        mockLogicalQuestion,
      );
      mockLogicalAnswersRepository.findOne.mockResolvedValueOnce(
        mockLogicalAnswer,
      );

      const result = await logicalAnswersService.validateLogicalAnswer(
        resultId,
        questionId,
        params,
      );

      expect(mockLogicalQuestionsRepository.findOne).toHaveBeenCalledWith({
        where: { id: questionId },
      });
      expect(mockLogicalAnswersRepository.findOne).toHaveBeenCalledWith({
        where: {
          questionId,
          resultId,
        },
      });
      expect(mockLogicalAnswersRepository.update).toHaveBeenCalledWith(
        mockLogicalAnswer.id,
        {
          candidateAnswer: params.candidateAnswer,
          isCorrect: 1,
          status: AnswerStatusEnum.DONE,
        },
      );
      expect(result).toEqual({ checkResult: true });
    });

    it('should throw an exception if logical question is not found', async () => {
      const questionId = 1;

      mockLogicalQuestionsRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        logicalAnswersService.validateLogicalAnswer(1, questionId, {
          candidateAnswer: 'Yes',
        }),
      ).rejects.toThrow(CustomizeException);

      expect(mockI18nService.t).toHaveBeenCalledWith(
        'message.LOGICAL_QUESTION_NOT_FOUND',
      );
    });

    it('should throw an exception if logical answer is already done', async () => {
      const questionId = 1;
      const resultId = 1;
      const mockLogicalQuestion = { id: questionId, result: 'Yes' };
      const mockLogicalAnswer = {
        id: 1,
        questionId,
        resultId,
        candidateAnswer: 'Yes',
      };

      mockLogicalQuestionsRepository.findOne.mockResolvedValueOnce(
        mockLogicalQuestion,
      );
      mockLogicalAnswersRepository.findOne.mockResolvedValueOnce(
        mockLogicalAnswer,
      );

      await expect(
        logicalAnswersService.validateLogicalAnswer(resultId, questionId, {
          candidateAnswer: 'Yes',
        }),
      ).rejects.toThrow(CustomizeException);

      expect(mockI18nService.t).toHaveBeenCalledWith(
        'message.LOGICAL_ANSWER_DONE',
      );
    });
  });

  describe('getLogicalQuestion', () => {
    it('should return the logical question if found', async () => {
      const questionId = 1;
      const mockLogicalQuestion = { id: questionId, result: 'Yes' };

      mockLogicalQuestionsRepository.findOne.mockResolvedValueOnce(
        mockLogicalQuestion,
      );

      const result = await logicalAnswersService.getLogicalQuestion(questionId);

      expect(mockLogicalQuestionsRepository.findOne).toHaveBeenCalledWith({
        where: { id: questionId },
      });
      expect(result).toEqual(mockLogicalQuestion);
    });

    it('should throw an exception if the logical question is not found', async () => {
      const questionId = 1;

      mockLogicalQuestionsRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        logicalAnswersService.getLogicalQuestion(questionId),
      ).rejects.toThrow(CustomizeException);

      expect(mockI18nService.t).toHaveBeenCalledWith(
        'message.LOGICAL_QUESTION_NOT_FOUND',
      );
    });
  });

  describe('getLogicalAnswer', () => {
    it('should return the logical answer if found', async () => {
      const questionId = 1;
      const resultId = 1;
      const mockLogicalAnswer = {
        id: 1,
        questionId,
        resultId,
        candidateAnswer: null,
      };

      mockLogicalAnswersRepository.findOne.mockResolvedValueOnce(
        mockLogicalAnswer,
      );

      const result = await logicalAnswersService.getLogicalAnswer(
        questionId,
        resultId,
      );

      expect(mockLogicalAnswersRepository.findOne).toHaveBeenCalledWith({
        where: { questionId, resultId },
      });
      expect(result).toEqual(mockLogicalAnswer);
    });

    it('should throw an exception if the logical answer is not found', async () => {
      const questionId = 1;
      const resultId = 1;

      mockLogicalAnswersRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        logicalAnswersService.getLogicalAnswer(questionId, resultId),
      ).rejects.toThrow(CustomizeException);

      expect(mockI18nService.t).toHaveBeenCalledWith(
        'message.LOGICAL_ANSWER_NOT_FOUND',
      );
    });

    it('should throw an exception if the logical answer is already done', async () => {
      const questionId = 1;
      const resultId = 1;
      const mockLogicalAnswer = {
        id: 1,
        questionId,
        resultId,
        candidateAnswer: 'Yes',
      };

      mockLogicalAnswersRepository.findOne.mockResolvedValueOnce(
        mockLogicalAnswer,
      );

      await expect(
        logicalAnswersService.getLogicalAnswer(questionId, resultId),
      ).rejects.toThrow(CustomizeException);

      expect(mockI18nService.t).toHaveBeenCalledWith(
        'message.LOGICAL_ANSWER_DONE',
      );
    });
  });
});
