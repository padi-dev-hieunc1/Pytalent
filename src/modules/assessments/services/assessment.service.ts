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
    let assessment: CreateAssessmentInterface;

    const existed_hr = await this.checkExistedHr(params.hrId);

    if (existed_hr) {
      const endTime = params.end_time
        ? moment(params.end_time, 'YYYY-MM-DD HH:mm:ss').toDate()
        : null;

      const currentTime = new Date();
      const startTime = params.start_time
        ? moment(params.start_time, 'YYYY-MM-DD HH:mm:ss').toDate()
        : currentTime;

      let statusAssessment = params.status;

      if (endTime === null) {
        statusAssessment = AssessmentStatusEnum.INFINITE;
      } else {
        // endTime < currentTime | endTime < startTime -> Expired -> Do not create new assessment
        endTime.getTime() > startTime.getTime() &&
        endTime.getTime() > currentTime.getTime()
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
        throw new CustomizeException(this.i18n.t('message.INVALID_END_TIME'));
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
    const existed_hr = await this.checkExistedHr(hrId);

    if (existed_hr) {
      const list_assessments: Assessments[] =
        await this.assessmentsRepository.findAllAssessments(hrId);

      if (list_assessments) return list_assessments;
      else return null;
    } else {
      throw new CustomizeException(this.i18n.t('message.HR_NOT_FOUND'));
    }
  }

  async getAllAssessmentsByCandidateId(candidateId: number) {
    const existed_candidate = await this.checkExistedCandidate(candidateId);

    if (existed_candidate) {
      const list_candidate_assessments: CandidateAssessments[] =
        await this.candidateAssessmentsRepository.findAssessmentsByCandidateId(
          candidateId,
        );

      if (list_candidate_assessments) {
        const list_assessments = list_candidate_assessments.map(
          (list_assessment) => list_assessment.assessment,
        );
        return list_assessments;
      } else return null;
    } else {
      throw new CustomizeException(this.i18n.t('message.CANDIDATE_NOT_FOUND'));
    }
  }

  async deleteAssessment(assessmentId: number) {
    const existed_assessment =
      await this.assessmentGameService.checkExistedAssessment(assessmentId);

    if (existed_assessment) {
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

  async updateScoreAssessment(assessmentId: number) {
    const games = await this.assessmentGameService.getAllGamesInAssessment(
      assessmentId,
    );

    let max_score = 0;
    if (games) {
      for (const game of games) {
        max_score += game.game.total_question_level;
      }
    }
    const updated_assessment = plainToClass(Assessments, {
      max_score: max_score,
    });

    return await this.assessmentsRepository.update(
      assessmentId,
      updated_assessment,
    );
  }

  async updateStatusAssessment(assessmentId: number) {
    const assessment: Assessments = await this.assessmentsRepository.findOne({
      where: {
        id: assessmentId,
      },
    });

    if (assessment && assessment.end_time) {
      const currentTime = new Date();
      const endTime = assessment.end_time;

      if (endTime.getTime() < currentTime.getTime()) {
        const updated_assessment = plainToClass(Assessments, {
          status: AssessmentStatusEnum.EXPIRED,
        });

        await this.assessmentsRepository.update(
          assessmentId,
          updated_assessment,
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

    if (candidate) {
      return candidate;
    } else {
      throw new CustomizeException(this.i18n.t('message.USER_NOT_FOUND'));
    }
  }

  async updateCandidateAssessment(candidateId: number, assessmentId: number) {
    const candidate_assessment =
      await this.candidateAssessmentsRepository.findOne({
        where: {
          candidateId: candidateId,
          assessmentId: assessmentId,
        },
      });

    if (candidate_assessment) {
      const game_results = await this.gameResultRepository.find({
        where: {
          candidateId: candidateId,
          assessmentId: assessmentId,
        },
      });

      let all_completed = true;

      for (const game_result of game_results) {
        if (game_result.status !== GameResultStatusEnum.COMPLETED) {
          all_completed = false;
          break;
        }
      }

      const new_status = all_completed
        ? CandidateAssessmentStatusEnum.COMPLETED
        : CandidateAssessmentStatusEnum.PROCESSING;

      const paramUpdate = plainToClass(CandidateAssessments, {
        status: new_status,
      });

      const updated = await this.candidateAssessmentsRepository.update(
        candidate_assessment.id,
        paramUpdate,
      );

      if (updated.affected === 1) return paramUpdate;
      else return null;
    } else {
      throw new CustomizeException(
        this.i18n.t('message.CANDIDATE_ASSESSMENT_NOT_FOUND'),
      );
    }
  }

  async archiveAssessment(assessmentId: number) {
    const assessment = await this.assessmentsRepository.findOne({
      where: {
        id: assessmentId,
      },
    });

    const archive = assessment.archive === 0 ? 1 : 0;

    if (assessment) {
      const paramUpdate = plainToClass(Assessments, {
        archive: archive,
      });

      const updated = await this.assessmentsRepository.update(
        assessmentId,
        paramUpdate,
      );

      if (updated.affected === 1) return paramUpdate;
      else return null;
    } else {
      throw new CustomizeException(this.i18n.t('message.ASSESSMENT_NOT_FOUND'));
    }
  }
}
