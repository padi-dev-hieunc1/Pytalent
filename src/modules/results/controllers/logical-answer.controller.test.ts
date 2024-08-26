import { Test, TestingModule } from '@nestjs/testing';
import { LogicalAnswersController } from './logical-answer.controller';
import { LogicalAnswersService } from '../services/logical-answer.service';
import { GameResultsService } from '../services/result.service';
import { UpdateLogicalAnswerDto } from '../dto/update-logical-answer.dto';
import { Response } from 'express';

describe('LogicalAnswersController unit', () => {
  let logicalAnswersController: LogicalAnswersController;
  let res: Response;

  const mockLogicalAnswersService = {
    validateLogicalAnswer: jest.fn(),
  };

  const mockGameResultsService = {
    validateGameResult: jest.fn(),
    updateLogicalGameResult: jest.fn(),
    findNextQuestion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogicalAnswersController],
      providers: [
        {
          provide: LogicalAnswersService,
          useValue: mockLogicalAnswersService,
        },
        {
          provide: GameResultsService,
          useValue: mockGameResultsService,
        },
      ],
    }).compile();

    logicalAnswersController = module.get<LogicalAnswersController>(
      LogicalAnswersController,
    );

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  });

  describe('answerLogicalQuestion', () => {
    it('should be defined', () => {
      expect(logicalAnswersController).toBeDefined();
    });

    it('should handle valid logic question', async () => {
      const resultId = 1;
      const questionId = 2;
      const updateLogicalAnswerDto: UpdateLogicalAnswerDto = {
        candidateAnswer: 'No',
      };
      const mockValidateLogicalAnswerResult = {
        checkResult: true,
      };
      const mockNextQuestion = {
        question: {
          id: 9,
          firstStatement: 'Statement J',
          secondStatement: 'Statement B',
          conclusion: 'Statement J is true.',
        },
      };

      mockGameResultsService.validateGameResult.mockResolvedValueOnce(
        undefined,
      );
      mockLogicalAnswersService.validateLogicalAnswer.mockResolvedValueOnce(
        mockValidateLogicalAnswerResult,
      );
      mockGameResultsService.updateLogicalGameResult.mockResolvedValueOnce(
        undefined,
      );
      mockGameResultsService.findNextQuestion.mockResolvedValueOnce(
        mockNextQuestion,
      );

      const successResponse = jest.spyOn(
        logicalAnswersController,
        'successResponse',
      );

      await logicalAnswersController.answerLogicalQuestion(
        resultId,
        questionId,
        updateLogicalAnswerDto,
        res,
      );

      expect(mockGameResultsService.validateGameResult).toHaveBeenCalledWith(
        resultId,
      );
      expect(
        mockLogicalAnswersService.validateLogicalAnswer,
      ).toHaveBeenCalledWith(resultId, questionId, updateLogicalAnswerDto);
      expect(
        mockGameResultsService.updateLogicalGameResult,
      ).toHaveBeenCalledWith(
        resultId,
        mockValidateLogicalAnswerResult.checkResult,
      );
      expect(mockGameResultsService.findNextQuestion).toHaveBeenCalledWith(
        resultId,
      );
      expect(successResponse).toHaveBeenCalledWith(
        {
          data: {
            checkResult: mockValidateLogicalAnswerResult.checkResult,
            nextQuestion: mockNextQuestion,
          },
          message: 'Complete answer logical question',
        },
        res,
      );
    });

    it('should handle game completion', async () => {
      const resultId = 1;
      const questionId = 2;
      const updateLogicalAnswerDto: UpdateLogicalAnswerDto = {
        candidateAnswer: 'No',
      };
      const mockValidateLogicalAnswerResult = {
        checkResult: true,
      };

      mockGameResultsService.validateGameResult.mockResolvedValueOnce(
        undefined,
      );
      mockLogicalAnswersService.validateLogicalAnswer.mockResolvedValueOnce(
        mockValidateLogicalAnswerResult,
      );
      mockGameResultsService.updateLogicalGameResult.mockResolvedValueOnce(
        undefined,
      );
      mockGameResultsService.findNextQuestion.mockResolvedValueOnce(null);

      const successResponse = jest.spyOn(
        logicalAnswersController,
        'successResponse',
      );

      await logicalAnswersController.answerLogicalQuestion(
        resultId,
        questionId,
        updateLogicalAnswerDto,
        res,
      );

      expect(mockGameResultsService.validateGameResult).toHaveBeenCalledWith(
        resultId,
      );
      expect(
        mockLogicalAnswersService.validateLogicalAnswer,
      ).toHaveBeenCalledWith(resultId, questionId, updateLogicalAnswerDto);
      expect(
        mockGameResultsService.updateLogicalGameResult,
      ).toHaveBeenCalledWith(
        resultId,
        mockValidateLogicalAnswerResult.checkResult,
      );
      expect(mockGameResultsService.findNextQuestion).toHaveBeenCalledWith(
        resultId,
      );
      expect(successResponse).toHaveBeenCalledWith(
        {
          message: 'Complete logical game',
        },
        res,
      );
    });
  });
});
