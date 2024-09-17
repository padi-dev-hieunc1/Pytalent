import { Test, TestingModule } from '@nestjs/testing';
import { LogicalAnswersController } from '../controllers/logical-answer.controller';
import { LogicalAnswersService } from '../services/logical-answer.service';
import { GameResultsService } from '../services/result.service';
import { UpdateLogicalAnswerDto } from '../dto/update-logical-answer.dto';
import { Response } from 'express';

describe('LogicalAnswersController unit', () => {
  let logicalAnswersController: LogicalAnswersController;
  let res: Response;

  const mockLogicalAnswersService = {
    isLogicalAnswerCorrect: jest.fn(),
    saveLogicalAnswer: jest.fn(),
  };

  const mockGameResultsService = {
    validateGameResult: jest.fn(),
    updateLogicalGameResult: jest.fn(),
    isLastLogicalQuestion: jest.fn(),
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

  afterEach(() => {
    jest.clearAllMocks();
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
      const mockIsLogicalAnswerCorrect = { checkResult: true };
      const mockNextQuestion = {
        question: {
          id: 9,
          firstStatement: 'Statement J',
          secondStatement: 'Statement B',
          conclusion: 'Statement J is true.',
        },
      };

      mockGameResultsService.validateGameResult.mockResolvedValueOnce({
        status: true,
        message: 'Valid game result',
      });
      mockLogicalAnswersService.isLogicalAnswerCorrect.mockResolvedValueOnce(
        mockIsLogicalAnswerCorrect,
      );
      mockLogicalAnswersService.saveLogicalAnswer.mockResolvedValueOnce(
        undefined,
      );
      mockGameResultsService.updateLogicalGameResult.mockResolvedValueOnce(
        undefined,
      );
      mockGameResultsService.isLastLogicalQuestion.mockResolvedValueOnce(false);
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
        mockLogicalAnswersService.isLogicalAnswerCorrect,
      ).toHaveBeenCalledWith(questionId, updateLogicalAnswerDto);
      expect(mockLogicalAnswersService.saveLogicalAnswer).toHaveBeenCalledWith(
        resultId,
        questionId,
        updateLogicalAnswerDto,
        mockIsLogicalAnswerCorrect.checkResult,
      );
      expect(
        mockGameResultsService.updateLogicalGameResult,
      ).toHaveBeenCalledWith(resultId, mockIsLogicalAnswerCorrect.checkResult);
      expect(mockGameResultsService.isLastLogicalQuestion).toHaveBeenCalledWith(
        resultId,
      );
      expect(mockGameResultsService.findNextQuestion).toHaveBeenCalledWith(
        resultId,
      );
      expect(successResponse).toHaveBeenCalledWith(
        {
          data: {
            checkResult: mockIsLogicalAnswerCorrect.checkResult,
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
      const mockIsLogicalAnswerCorrect = { checkResult: true };

      mockGameResultsService.validateGameResult.mockResolvedValueOnce({
        status: true,
        message: 'Valid game result',
      });
      mockLogicalAnswersService.isLogicalAnswerCorrect.mockResolvedValueOnce(
        mockIsLogicalAnswerCorrect,
      );
      mockLogicalAnswersService.saveLogicalAnswer.mockResolvedValueOnce(
        undefined,
      );
      mockGameResultsService.updateLogicalGameResult.mockResolvedValueOnce(
        undefined,
      );
      mockGameResultsService.isLastLogicalQuestion.mockResolvedValueOnce(true);

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
        mockLogicalAnswersService.isLogicalAnswerCorrect,
      ).toHaveBeenCalledWith(questionId, updateLogicalAnswerDto);
      expect(mockLogicalAnswersService.saveLogicalAnswer).toHaveBeenCalledWith(
        resultId,
        questionId,
        updateLogicalAnswerDto,
        mockIsLogicalAnswerCorrect.checkResult,
      );
      expect(
        mockGameResultsService.updateLogicalGameResult,
      ).toHaveBeenCalledWith(resultId, mockIsLogicalAnswerCorrect.checkResult);
      expect(mockGameResultsService.isLastLogicalQuestion).toHaveBeenCalledWith(
        resultId,
      );
      expect(successResponse).toHaveBeenCalledWith(
        {
          message: 'Complete logical game',
        },
        res,
      );
    });

    it('should handle game result validation failure', async () => {
      const resultId = 1;
      const questionId = 2;
      const updateLogicalAnswerDto: UpdateLogicalAnswerDto = {
        candidateAnswer: 'No',
      };

      mockGameResultsService.validateGameResult.mockResolvedValueOnce({
        status: false,
        message: 'Game Finished',
      });

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
      expect(successResponse).toHaveBeenCalledWith(
        {
          message: 'Game Finished',
        },
        res,
      );
      expect(
        mockLogicalAnswersService.isLogicalAnswerCorrect,
      ).not.toHaveBeenCalled();
      expect(
        mockLogicalAnswersService.saveLogicalAnswer,
      ).not.toHaveBeenCalled();
      expect(
        mockGameResultsService.updateLogicalGameResult,
      ).not.toHaveBeenCalled();
      expect(
        mockGameResultsService.isLastLogicalQuestion,
      ).not.toHaveBeenCalled();
    });
  });
});
