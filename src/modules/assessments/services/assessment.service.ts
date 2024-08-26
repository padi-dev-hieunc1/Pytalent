import { Injectable } from '@nestjs/common';
import { UsersRepository } from '@modules/users/repositories/user.repository';
import * as moment from 'moment';
import { I18nService } from 'nestjs-i18n';
import { AssessmentsRepository } from '../repositories/assessment.repository';
import { CustomizeException } from '@exception/customize.exception';
import { plainToClass } from 'class-transformer';
import { Assessments } from '@entities/assessments.entity';
import { CreateAssessmentInterface } from '@shared/interfaces/assessment.interface';
import { AssessmentStatusEnum } from '@common/enum/assessment-status.enum';
import { Users } from '@entities/users.entity';
import { RoleEnum } from '@common/enum/role.enum';
import { CandidateAssessmentDto } from '../dto/candidate-assessment.dto';
import { CandidateAssessmentInterface } from '@shared/interfaces/candidate-assessment.interface';
import { CandidateAssessmentStatusEnum } from '@common/enum/candidate-assessment-status.enum';
import { CandidateAssessments } from '@entities/candidate-assessment';
import { CandidateAssessmentsRepository } from '../repositories/candidate-assessment.repository';
import { CreateUserInterface } from '@shared/interfaces/user.interface';
import { AssessmentGamesService } from '@modules/assessment-games/services/assessment-game.service';
import { GameResultsRepository } from '@modules/results/repositories/result.repository';
import { GameResultStatusEnum } from '@common/enum/game-result-status.enum';

@Injectable()
export class AssessmentsService {
  constructor(
    private assessmentsRepository: AssessmentsRepository,
    private usersRepository: UsersRepository,
    private candidateAssessmentsRepository: CandidateAssessmentsRepository,
    private assessmentGameService: AssessmentGamesService,
    private readonly gameResultRepository: GameResultsRepository,
    private readonly i18n: I18nService,
  ) {}

  async checkExistedHr(hrId: number) {
    const hr: Users = await this.usersRepository.findOne({
      where: {
        id: hrId,
        role: RoleEnum.HR,
      },
    });

    if (hr) return true;
    else return false;
  }

  async checkExistedCandidate(candidateId: number) {
    const candidate: Users = await this.usersRepository.findOne({
      where: {
        id: candidateId,
        role: RoleEnum.CANDIDATE,
      },
    });

    if (candidate) return true;
    else return false;
  }

  async createAssessment(params: CreateAssessmentInterface) {
    const existedHr = await this.checkExistedHr(params.hrId);

    if (!existedHr)
      throw new CustomizeException(this.i18n.t('message.HR_NOT_FOUND'));

    const endTime = params.endTime
      ? moment(params.endTime, 'YYYY-MM-DD HH:mm:ss').toDate()
      : null;

    const currentTime = new Date();
    const startTime = params.startTime
      ? moment(params.startTime, 'YYYY-MM-DD HH:mm:ss').toDate()
      : currentTime;

    const statusAssessment = this.determineAssessmentStatus(
      startTime,
      endTime,
      currentTime,
    );

    if (statusAssessment === AssessmentStatusEnum.EXPIRED) {
      throw new CustomizeException(this.i18n.t('message.INVALID_END_TIME'));
    }

    const paramCreate: CreateAssessmentInterface = plainToClass(Assessments, {
      name: params.name,
      startTime: startTime,
      endTime: endTime,
      status: statusAssessment,
      hrId: params.hrId,
    });

    const assessment = await this.assessmentsRepository.save(paramCreate);

    return assessment;
  }

  private determineAssessmentStatus(
    startTime: Date,
    endTime: Date | null,
    currentTime: Date,
  ): AssessmentStatusEnum {
    if (endTime === null) {
      return AssessmentStatusEnum.INFINITE;
    }

    if (
      endTime.getTime() > startTime.getTime() &&
      endTime.getTime() > currentTime.getTime()
    ) {
      return AssessmentStatusEnum.LIMIT_END_TIME;
    }

    return AssessmentStatusEnum.EXPIRED;
  }

  async getDetailAssessment(assessmentId: number) {
    const assessment: Assessments = await this.assessmentsRepository.findOne({
      where: {
        id: assessmentId,
      },
    });

    if (assessment) {
      if (assessment?.archive === 1) {
        throw new CustomizeException(
          this.i18n.t('message.ASSESSMENT_ARCHIVED'),
        );
      }
      return assessment;
    } else
      throw new CustomizeException(this.i18n.t('message.ASSESSMENT_NOT_FOUND'));
  }

  async getAllAssessmentsByHrId(hrId: number) {
    const existedHr = await this.checkExistedHr(hrId);

    if (!existedHr)
      throw new CustomizeException(this.i18n.t('message.HR_NOT_FOUND'));

    const listAssessments: Assessments[] =
      await this.assessmentsRepository.findAllAssessments(hrId);

    if (listAssessments.length === 0)
      throw new CustomizeException('Hr has not created any assessments before');

    return listAssessments;
  }

  async getAllAssessmentsByCandidateId(candidateId: number) {
    const existedCandidate = await this.checkExistedCandidate(candidateId);

    if (!existedCandidate)
      throw new CustomizeException(this.i18n.t('message.CANDIDATE_NOT_FOUND'));

    const listCandidateAssessments: CandidateAssessments[] =
      await this.candidateAssessmentsRepository.findAssessmentsByCandidateId(
        candidateId,
      );

    if (listCandidateAssessments) {
      const listAssessments = listCandidateAssessments.map(
        (listAssessment) => listAssessment.assessment,
      );
      return listAssessments;
    } else return null;
  }

  async deleteAssessment(assessmentId: number) {
    const existedAssessment =
      await this.assessmentGameService.checkExistedAssessment(assessmentId);

    if (!existedAssessment)
      throw new CustomizeException(this.i18n.t('message.ASSESSMENT_NOT_FOUND'));

    return await this.assessmentsRepository
      .createQueryBuilder()
      .delete()
      .from(Assessments)
      .where('id = :id', { id: assessmentId })
      .execute();
  }

  async inviteCandidates(params: CandidateAssessmentDto) {
    const assessment: Assessments = await this.assessmentsRepository.findOne({
      where: {
        id: params.assessmentId,
      },
    });

    if (assessment.archive === 1) {
      throw new CustomizeException(this.i18n.t('message.ASSESSMENT_ARCHIVED'));
    }

    if (assessment.status === AssessmentStatusEnum.EXPIRED) {
      throw new CustomizeException(this.i18n.t('message.ASSESSMENT_EXPIRED'));
    } else {
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
        throw new CustomizeException(
          this.i18n.t('message.ASSESSMENT_NOT_FOUND'),
        );
      }
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
      const paramCreate: CreateUserInterface = plainToClass(Users, {
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
    const candidateAssessment: CandidateAssessments =
      await this.candidateAssessmentsRepository.findOne({
        where: {
          candidateId: params.candidateId,
          assessmentId: params.assessmentId,
        },
      });

    if (!candidateAssessment) {
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

  async updateScoreAssessment(assessmentId: number) {
    const games = await this.assessmentGameService.getAllGamesInAssessment(
      assessmentId,
    );

    let maxScore = 0;
    if (games) {
      for (const game of games) {
        maxScore += game.game.totalQuestionLevel;
      }
    }
    const updatedAssessment = plainToClass(Assessments, {
      maxScore: maxScore,
    });

    return await this.assessmentsRepository.update(
      assessmentId,
      updatedAssessment,
    );
  }

  async updateStatusAssessment(assessmentId: number) {
    const assessment: Assessments = await this.assessmentsRepository.findOne({
      where: {
        id: assessmentId,
      },
    });

    if (assessment && assessment.endTime) {
      const currentTime = new Date();
      const endTime = assessment.endTime;

      if (endTime.getTime() < currentTime.getTime()) {
        const updatedAssessment = plainToClass(Assessments, {
          status: AssessmentStatusEnum.EXPIRED,
        });

        await this.assessmentsRepository.update(
          assessmentId,
          updatedAssessment,
        );
      }
    } else {
      throw new CustomizeException(this.i18n.t('message.ASSESSMENT_NOT_FOUND'));
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

    if (!candidate)
      throw new CustomizeException(this.i18n.t('message.USER_NOT_FOUND'));

    return candidate;
  }

  async updateCandidateAssessment(candidateId: number, assessmentId: number) {
    const candidateAssessment =
      await this.candidateAssessmentsRepository.findOne({
        where: {
          candidateId: candidateId,
          assessmentId: assessmentId,
        },
      });

    if (!candidateAssessment)
      throw new CustomizeException(
        this.i18n.t('message.CANDIDATE_ASSESSMENT_NOT_FOUND'),
      );

    const gameResults = await this.gameResultRepository.find({
      where: {
        candidateId: candidateId,
        assessmentId: assessmentId,
      },
    });

    let allCompleted = true;

    for (const gameResult of gameResults) {
      if (gameResult.status !== GameResultStatusEnum.COMPLETED) {
        allCompleted = false;
        break;
      }
    }

    const newStatus = allCompleted
      ? CandidateAssessmentStatusEnum.COMPLETED
      : CandidateAssessmentStatusEnum.PROCESSING;

    const paramUpdate = plainToClass(CandidateAssessments, {
      status: newStatus,
    });

    const updated = await this.candidateAssessmentsRepository.update(
      candidateAssessment.id,
      paramUpdate,
    );

    if (updated.affected === 1) return paramUpdate;
    else return null;
  }

  async archiveAssessment(assessmentId: number) {
    const assessment = await this.assessmentsRepository.findOne({
      where: {
        id: assessmentId,
      },
    });

    const archive = assessment.archive === 0 ? 1 : 0;

    if (!assessment)
      throw new CustomizeException(this.i18n.t('message.ASSESSMENT_NOT_FOUND'));

    const paramUpdate = plainToClass(Assessments, {
      archive: archive,
    });

    const updated = await this.assessmentsRepository.update(
      assessmentId,
      paramUpdate,
    );

    if (updated.affected === 1) return paramUpdate;
    else return null;
  }
}
