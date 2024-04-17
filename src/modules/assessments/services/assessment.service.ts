import { Injectable } from '@nestjs/common';
import { AssessmentsRepository } from '../repositories/assessment.repository';
import { CreateAssessmentInterface } from '@shared/interfaces/assessment.interface';
import { Assessments } from '@entities/assessments.entity';
import { plainToClass } from 'class-transformer';
import { AssessmentStatusEnum } from '@common/enum/assessment-status.enum';
import { Users } from '@entities/users.entity';
import { UsersRepository } from '@modules/users/repositories/user.repository';
import * as moment from 'moment';
import { createUserInterface } from '@shared/interfaces/user.interface';
import { CandidateAssessmentInterface } from '@shared/interfaces/candidate-assessment.interface';
import { RoleEnum } from '@common/enum/role.enum';
import { CandidateAssessments } from '@entities/candidate-assessment';
import { CandidateAssessmentsRepository } from '../repositories/candidate-assessment.repository';
import { CandidateAssessmentDto } from '../dto/candidate-assessment.dto';
import { CandidateAssessmentStatusEnum } from '@common/enum/candidate-assessment-status.enum';
import { CustomizeException } from '@exception/customize.exception';
import { I18nService } from 'nestjs-i18n';
import { getConnection } from 'typeorm';
import { Games } from '@entities/games.entity';
import { AnswerGames } from '@entities/answer-games.entity';

@Injectable()
export class AssessmentsService {
  constructor(
    private assessmentsRepository: AssessmentsRepository,
    private usersRepository: UsersRepository,
    private candidateAssessmentsRepository: CandidateAssessmentsRepository,
    private readonly i18n: I18nService,
  ) {}

  async createAssessment(params: CreateAssessmentInterface) {
    let assessment: CreateAssessmentInterface;

    const hr: Users = await this.usersRepository.findOne({
      where: {
        id: params.hrId,
        role: RoleEnum.HR,
      },
    });

    if (hr) {
      const endTime = params.end_time
        ? moment(params.end_time, 'YYYY-MM-DD HH:mm:ss').utc(true).toDate()
        : null;

      const currentTime = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);

      const startTime = params.start_time
        ? moment(params.start_time, 'YYYY-MM-DD HH:mm:ss').utc(true).toDate()
        : currentTime;

      let statusAssessment = params.status;

      if (endTime === null) {
        statusAssessment = AssessmentStatusEnum.INFINITE;
      } else {
        // endTime < currentTime -> Expired -> Do not create new assessment
        endTime.getTime() > startTime.getTime()
          ? (statusAssessment = AssessmentStatusEnum.LIMIT_END_TIME)
          : (statusAssessment = AssessmentStatusEnum.EXPIRED);
      }

      const paramCreate: CreateAssessmentInterface = plainToClass(Assessments, {
        name: params.name,
        start_time: startTime,
        end_time: endTime,
        status: statusAssessment,
        hrId: params.hrId,
      });

      if (statusAssessment !== 'Expired') {
        assessment = await this.assessmentsRepository.save(paramCreate);
      } else {
        throw new CustomizeException(this.i18n.t('message.ASSESSMENT_EXPIRED'));
      }

      return assessment;
    } else {
      throw new CustomizeException(this.i18n.t('message.HR_NOT_FOUND'));
    }
  }

  async getDetailAssessment(assessmentId: number) {
    const assessment: Assessments = await this.assessmentsRepository.findOne({
      where: {
        id: assessmentId,
      },
      relations: ['game', 'hr'],
    });

    return assessment;
  }

  async getAllAssessmentsByHr(hrId: number) {
    const hr: Users = await this.usersRepository.findOne({
      where: {
        id: hrId,
        role: RoleEnum.HR,
      },
    });

    if (hr) {
      const listAssessments: Assessments[] =
        await this.assessmentsRepository.findAllAssessments(hrId);

      if (listAssessments) return listAssessments;
      else return null;
    } else {
      throw new CustomizeException(this.i18n.t('message.HR_NOT_FOUND'));
    }
  }

  async deleteAssessment(assessmentId: number) {
    const assessment: Assessments = await this.assessmentsRepository.findOne({
      where: {
        id: assessmentId,
      },
    });

    if (assessment) {
      return await this.assessmentsRepository
        .createQueryBuilder()
        .delete()
        .from(Assessments)
        .where('id = :id', { id: assessmentId })
        .execute();
    } else {
      throw new CustomizeException(this.i18n.t('message.ASSESSMENT_NOT_FOUND'));
    }
  }

  async inviteCandidates(params: CandidateAssessmentDto) {
    const assessment: Assessments = await this.assessmentsRepository.findOne({
      where: {
        id: params.assessmentId,
      },
    });

    console.log(assessment);

    const listCandidates: Users[] = [];
    const listCandidateAssessments: CandidateAssessmentInterface[] = [];

    if (assessment) {
      for (const email of params.list_candidate_emails) {
        const candidate = await this.createCandidate(email);
        listCandidates.push(candidate);
      }

      for (const candidate of listCandidates) {
        const candidateAssessment = await this.createCandidateAssessment({
          assessmentId: params.assessmentId,
          candidateId: candidate.id,
          status: CandidateAssessmentStatusEnum.PENDING,
        });

        listCandidateAssessments.push(candidateAssessment);
      }

      return listCandidateAssessments;
    } else {
      throw new CustomizeException(this.i18n.t('message.ASSESSMENT_NOT_FOUND'));
    }
  }

  async createCandidate(email: string) {
    let candidate: Users = await this.usersRepository.findOne({
      where: {
        email: email,
      },
    });

    const password = this.generateRandomPassword();
    const username = email.split('@')[0].toUpperCase();

    if (!candidate) {
      const paramCreate: createUserInterface = plainToClass(Users, {
        email: email,
        // password: await bcrypt.hash(password, 10),
        password: password,
        username: username,
        role: RoleEnum.CANDIDATE,
      });

      candidate = await this.usersRepository.save(paramCreate);
    }

    return candidate;
  }

  generateRandomPassword() {
    const symbols = '!@#$%^&*()-_=+';
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';

    // Random 3 digits
    const randomNumbers = Array.from({ length: 3 }, () =>
      numbers.charAt(Math.floor(Math.random() * numbers.length)),
    );

    // Random 2 letters
    const randomLetters = Array.from({ length: 2 }, () =>
      letters.charAt(Math.floor(Math.random() * letters.length)),
    );

    // Random 1 special symbol
    const randomSymbol = symbols.charAt(
      Math.floor(Math.random() * symbols.length),
    );

    const password = randomNumbers.concat(randomLetters, randomSymbol).join('');
    return password;
  }

  async createCandidateAssessment(params: CandidateAssessmentInterface) {
    const candidate_assessment: CandidateAssessments =
      await this.candidateAssessmentsRepository.findOne({
        where: {
          candidateId: params.candidateId,
          assessmentId: params.assessmentId,
        },
      });

    if (!candidate_assessment) {
      const paramCreate: CandidateAssessmentInterface = plainToClass(
        CandidateAssessments,
        {
          candidateId: params.candidateId,
          assessmentId: params.assessmentId,
          status: CandidateAssessmentStatusEnum.PENDING,
        },
      );

      const assessmentCandidate =
        await this.candidateAssessmentsRepository.save(paramCreate);

      return assessmentCandidate;
    } else {
      return null;
    }
  }

  async calculateTotalScoreOfAssessment(assessmentId: number) {
    const games = (await this.getDetailAssessment(assessmentId)).game;
    if (games) {
      let max_score = 0;
      for (const game of games) {
        max_score += game.max_score_level;
      }

      return max_score;
    } else {
      throw new CustomizeException(
        this.i18n.t('message.GAME_NOT_FOUND_IN_ASSESSMENT'),
      );
    }
  }

  async getCandidateInformation(candidateId: number) {
    const candidate = await this.usersRepository.findOne({
      where: {
        id: candidateId,
        role: RoleEnum.CANDIDATE,
      },
      select: ['email', 'username'],
    });

    if (candidate) {
      return candidate;
    } else {
      throw new CustomizeException(this.i18n.t('message.USER_NOT_FOUND'));
    }
  }
}
