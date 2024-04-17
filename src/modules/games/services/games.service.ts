import { Injectable } from '@nestjs/common';
import { GamesRepository } from '../repositories/games.repository';
import { LogicalQuestionsRepository } from '../repositories/logical-questions.repository';
import { LogicalQuestions } from '@entities/logical-questions.entity';
import { AssessmentsRepository } from '@modules/assessments/repositories/assessment.repository';
import { Assessments } from '@entities/assessments.entity';
import { HrGames } from '@entities/hr-games.entity';
import { HrGamesRepository } from '@modules/users/repositories/hr-game.repository';
import {
  CreateLogicalGameInterface,
  CreateMemoryGameInterface,
} from '@shared/interfaces/game.interface';
import { plainToClass } from 'class-transformer';
import { GameCategoryEnum } from '@common/enum/game-category.enum';
import { Games } from '@entities/games.entity';
import { CreateGameDto } from '../dto/create-game.dto';
import { GameStatusEnum } from '@common/enum/game-status.enum';
import { AnswerGames } from '@entities/answer-games.entity';
import {
  CreateInitialAnswerInterface,
  UpdateAnswerInterface,
} from '@shared/interfaces/answer.interface';
import { AnswerGamesRepository } from '../repositories/answer-games.repository';
import { MemoryQuestionsRepository } from '../repositories/memory-questions.repository';
import { MemoryQuestions } from '@entities/memory-questions.entity';
import { CustomizeException } from '@exception/customize.exception';
import { I18nService } from 'nestjs-i18n';
import { differenceInSeconds } from 'date-fns';

@Injectable()
export class GamesService {
  constructor(
    private gameRepository: GamesRepository,
    private logicalQuestionsRepository: LogicalQuestionsRepository,
    private memoryQuestionsRepository: MemoryQuestionsRepository,
    private assessmentRepository: AssessmentsRepository,
    private hrGamesRepository: HrGamesRepository,
    private answerGamesRepository: AnswerGamesRepository,
    private readonly i18n: I18nService,
  ) {}

  async randomLogicalQuestions(): Promise<LogicalQuestions[]> {
    const yesQuestions = await this.logicalQuestionsRepository
      .createQueryBuilder()
      .where('result = :result', { result: 'Yes' })
      .orderBy('RAND()')
      .take(10)
      .getMany();

    const noQuestions = await this.logicalQuestionsRepository
      .createQueryBuilder()
      .where('result = :result', { result: 'No' })
      .orderBy('RAND()')
      .take(10)
      .getMany();

    const shuffledLogicalQuestions: LogicalQuestions[] = [];
    let consecutiveYesCount = 0;
    let consecutiveNoCount = 0;

    // Cứ sau 3 câu Yes(No) thì sau nó phải là ít nhất 2 câu No (Yes)
    while (yesQuestions.length > 0 || noQuestions.length > 0) {
      let selectedQuestion1: LogicalQuestions | undefined;
      let selectedQuestion2: LogicalQuestions | undefined;

      const result = Math.random() < 0.5 ? 'Yes' : 'No';

      if (consecutiveYesCount === 3) {
        selectedQuestion1 = noQuestions.pop();
        selectedQuestion2 = noQuestions.pop();
        shuffledLogicalQuestions.push(selectedQuestion1, selectedQuestion2);
        consecutiveNoCount += 2;
        consecutiveYesCount = 0; // Reset consecutiveYesCount
      } else if (consecutiveNoCount === 3) {
        selectedQuestion1 = yesQuestions.pop();
        selectedQuestion2 = yesQuestions.pop();
        shuffledLogicalQuestions.push(selectedQuestion1, selectedQuestion2);
        consecutiveYesCount += 2;
        consecutiveNoCount = 0; // Reset consecutiveNoCount
      } else {
        if (result === 'Yes') {
          selectedQuestion1 = yesQuestions.pop();
          shuffledLogicalQuestions.push(selectedQuestion1);
          consecutiveYesCount++;
          consecutiveNoCount = 0; // Reset consecutiveNoCount
        } else if (result === 'No') {
          selectedQuestion1 = noQuestions.pop();
          shuffledLogicalQuestions.push(selectedQuestion1);
          consecutiveNoCount++;
          consecutiveYesCount = 0; // Reset consecutiveNoCount
        }
      }
    }

    const filteredShuffledLogicalQuestions = shuffledLogicalQuestions.filter(
      (logicalQuestion) => logicalQuestion !== undefined,
    );

    return filteredShuffledLogicalQuestions;
    // const logicalQuestions = [...yesQuestions, ...noQuestions];

    // Shuffle
    // const shuffledLogicalQuestions = this.shuffleArray(logicalQuestions);

    // return shuffledLogicalQuestions;
  }

  // private shuffleArray<T>(array: T[]): T[] {
  //   const shuffledArray = [...array]; // Tạo bản sao của mảng

  //   for (let i = shuffledArray.length - 1; i > 0; i--) {
  //     const j = Math.floor(Math.random() * (i + 1)); // Chọn phần tử ngẫu nhiên

  //     [shuffledArray[i], shuffledArray[j]] = [
  //       shuffledArray[j],
  //       shuffledArray[i],
  //     ];
  //   }

  //   return shuffledArray;
  // }

  async getAllCategoryGamesInAssessment(assessmentId: number) {
    const assessment: Assessments = await this.assessmentRepository.findOne({
      where: {
        id: assessmentId,
      },
    });

    if (assessment) {
      const hrId = assessment.hrId;

      const gameCategories: HrGames[] =
        await this.hrGamesRepository.findAllCategoryGames(hrId);

      const listGameCategories: string[] = [];

      gameCategories.map((gameCategory) =>
        listGameCategories.push(gameCategory.category),
      );

      return listGameCategories;
    } else {
      return null;
    }
  }

  async createNewLogicalGame(params: CreateGameDto) {
    const existed_game: Games = await this.gameRepository.findOne({
      where: {
        category: GameCategoryEnum.LOGICAL,
        candidate_email: params.candidate_email,
        assessmentId: params.assessmentId,
      },
    });

    if (existed_game) {
      throw new CustomizeException(this.i18n.t('message.GAME_PLAY_ONCE'));
    } else {
      const logicalRandomQuestions = await this.randomLogicalQuestions();
      const listLogicalQuestions: number[] = [];
      logicalRandomQuestions.map((question) =>
        listLogicalQuestions.push(question.id),
      );

      const str_logical_questions = listLogicalQuestions.join(',');

      const start_time = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
      const update_time = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);

      const paramCreate: CreateLogicalGameInterface = plainToClass(Games, {
        category: GameCategoryEnum.LOGICAL,
        time_limit: 90,
        total_question_level: 20,
        max_score_level: 20,
        questions: str_logical_questions,
        candidate_email: params.candidate_email,
        assessmentId: params.assessmentId,
        status: GameStatusEnum.NOT_COMPLETED,
        created_at: start_time,
        updated_at: update_time,
      });

      const logicalGame = await this.gameRepository.save(paramCreate);
      return logicalGame;
    }
  }

  async getDetailLogicalQuestion(questionId: number) {
    const logicalQuestion = await this.logicalQuestionsRepository.findOne({
      where: {
        id: questionId,
      },
      select: [
        'id',
        'title',
        'first_statement',
        'second_statement',
        'conclusion',
      ],
    });

    return logicalQuestion;
  }

  async updateLogicalAnswer(params: UpdateAnswerInterface) {
    const question: LogicalQuestions =
      await this.logicalQuestionsRepository.findOne({
        where: {
          id: params.questionId,
        },
      });

    const checkAnswer: number =
      question?.result === params.candidate_answer ? 1 : 0;

    const initial_answer: AnswerGames =
      await this.answerGamesRepository.findOne({
        where: {
          questionId: params.questionId,
          gameId: params.gameId,
        },
      });

    const paramCreate: UpdateAnswerInterface = plainToClass(AnswerGames, {
      gameId: params.gameId,
      questionId: params.questionId,
      candidate_answer: params.candidate_answer,
      is_correct: checkAnswer,
    });

    const answer = await this.answerGamesRepository.update(
      initial_answer.id,
      paramCreate,
    );
    return answer;
  }

  async createInitialAnswer(params: CreateInitialAnswerInterface) {
    const answer: AnswerGames = await this.answerGamesRepository.findOne({
      where: {
        gameId: params.gameId,
        questionId: params.questionId,
      },
    });

    if (!answer) {
      const paramCreate: CreateInitialAnswerInterface = plainToClass(
        AnswerGames,
        {
          gameId: params.gameId,
          questionId: params.questionId,
        },
      );

      await this.answerGamesRepository.save(paramCreate);
    } else {
      throw new CustomizeException(this.i18n.t('message.ANSWER_EXISTED'));
    }
  }

  async checkExistAnswer(params: CreateInitialAnswerInterface) {
    const answer: AnswerGames = await this.answerGamesRepository.findOne({
      where: {
        gameId: params.gameId,
        questionId: params.questionId,
      },
    });

    if (answer) return answer;
    else return null;
  }

  async completeGame(gameId: number) {
    const listAnswers = await this.answerGamesRepository.findAllAnswer(gameId);

    let total_result = 0;
    for (const answer of listAnswers) {
      if (answer.is_correct) {
        total_result += 1;
      }
    }

    const game: Games = await this.gameRepository.findOne({
      where: {
        id: gameId,
      },
      relations: ['answer', 'assessment'],
    });

    // Update correct answer and complete time
    const update_time = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);

    const start_time = game.created_at;

    const timeDiffSeconds = differenceInSeconds(new Date(), start_time);

    const updateResult = await this.gameRepository
      .createQueryBuilder()
      .update(Games)
      .set({
        status: GameStatusEnum.COMPLETED,
        complete_time: timeDiffSeconds,
        complete_question: total_result,
        updated_at: update_time,
      })
      .where('id = :gameId', { gameId })
      .execute();

    if (updateResult.affected > 0) {
      const updatedGame = await this.gameRepository.findOne({
        where: {
          id: gameId,
        },
      });
      if (updatedGame) {
        return updatedGame;
      } else {
        throw new CustomizeException(this.i18n.t('message.GAME_NOT_FOUND'));
      }
    } else throw new CustomizeException(this.i18n.t('message.UPDATED_FAIL'));
  }

  async createNewMemoryGame(params: CreateGameDto) {
    const existed_game: Games = await this.gameRepository.findOne({
      where: {
        category: GameCategoryEnum.MEMORY,
        candidate_email: params.candidate_email,
        assessmentId: params.assessmentId,
      },
    });

    if (existed_game) {
      throw new CustomizeException(this.i18n.t('message.GAME_PLAY_ONCE'));
    } else {
      const start_time = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
      console.log('check start:::', start_time);
      const update_time = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
      console.log('check end:::', update_time);

      const paramCreate: CreateMemoryGameInterface = plainToClass(Games, {
        category: GameCategoryEnum.MEMORY,
        total_question_level: 25,
        max_score_level: 25,
        candidate_email: params.candidate_email,
        assessmentId: params.assessmentId,
        status: GameStatusEnum.NOT_COMPLETED,
        created_at: start_time,
        updated_at: update_time,
      });

      const memoryGame = await this.gameRepository.save(paramCreate);
      return memoryGame;
    }
  }

  async getRandomDetailMemoryQuestion(level: number) {
    const memoryQuestion = await this.memoryQuestionsRepository
      .createQueryBuilder()
      .where('level = :level', { level: level })
      .orderBy('RAND()')
      .limit(1)
      .getOne();

    return memoryQuestion;
  }

  async getDetailMemoryQuestion(questionId: number) {
    const memoryQuestion = await this.memoryQuestionsRepository.findOne({
      where: {
        id: questionId,
      },
    });

    return memoryQuestion ?? null;
  }

  async updateMemoryAnswer(params: UpdateAnswerInterface) {
    const question: MemoryQuestions =
      await this.memoryQuestionsRepository.findOne({
        where: {
          id: params.questionId,
        },
      });

    const answer: AnswerGames = await this.answerGamesRepository.findOne({
      where: {
        questionId: params.questionId,
        gameId: params.gameId,
      },
    });

    const question_title = question.title.split(' ');
    const candidate_answer_arrows = params.candidate_answer.split(' ');
    const candidate_answer_len = candidate_answer_arrows.length;
    let check_question: number;

    if (candidate_answer_len <= question.level) {
      if (
        candidate_answer_arrows[candidate_answer_len - 1] !==
        question_title[candidate_answer_len - 1]
      ) {
        return await this.completeGame(params.gameId);
      } else {
        check_question = params.candidate_answer === question.title ? 1 : 0;
      }
    }

    const paramUpdate: UpdateAnswerInterface = plainToClass(AnswerGames, {
      gameId: params.gameId,
      questionId: params.questionId,
      candidate_answer: params.candidate_answer,
      is_correct: check_question,
    });

    const update_answer = await this.answerGamesRepository.update(
      answer.id,
      paramUpdate,
    );
    return update_answer;
  }

  async getDetailGame(gameId: number) {
    const game: Games = await this.gameRepository.findOne({
      where: {
        id: gameId,
      },
      relations: ['answer', 'assessment'],
    });

    return game;
  }

  async exportAllGames() {
    const all_games: Games = await this.gameRepository.findAllGames();

    if (all_games) return all_games;
    else return null;
  }
}
