import {
  Controller,
  Post,
  UseGuards,
  Body,
  Res,
  Get,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { BaseController } from '@modules/app/base.controller';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import { AuthorizationGuard } from '@guards/authorization.guard';
import { RoleEnum } from '@common/enum/role.enum';
import { CreateAssessmentDto } from '../dto/create-assessment.dto';
import { AssessmentsService } from '../services/assessment.service';
import { Response } from 'express';
import { Assessments } from '@entities/assessments.entity';
import { AssessmentStatusEnum } from '@common/enum/assessment-status.enum';
import { CandidateAssessmentDto } from '../dto/candidate-assessment.dto';
import { CustomizeException } from '@exception/customize.exception';
import { I18nService } from 'nestjs-i18n';
import { MailService } from '@modules/mail/mail.service';

@Controller('api/v1/assessments')
export class AssessmentsController extends BaseController {
  constructor(
    private readonly assessmentService: AssessmentsService,
    private readonly i18n: I18nService,
    private readonly mailService: MailService,
  ) {
    super();
  }

  @Get('/:hrId')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.HR]))
  async getAllAssessmentsByHr(
    @Param('hrId') hrId: number,
    @Res() res: Response,
  ) {
    const assessments = await this.assessmentService.getAllAssessmentsByHr(
      hrId,
    );

    if (assessments.length > 0) {
      const assessment_links = assessments.map((assessment) => ({
        name: assessment.name,
        link: `http://localhost:3000/api/v1/assessments/detail/${assessment.id}`,
      }));

      return this.successResponse(
        {
          data: assessment_links,
          message: 'success',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'Hr has not created any assessments before',
        },
        res,
      );
    }
  }

  @Post('/create')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.HR]))
  async createAssessment(
    @Body() createAssessmentDto: CreateAssessmentDto & Assessments,
    @Res() res: Response,
  ) {
    const newAssessment = await this.assessmentService.createAssessment(
      createAssessmentDto,
    );

    if (
      newAssessment &&
      newAssessment.status !== AssessmentStatusEnum.EXPIRED
    ) {
      return this.successResponse(
        {
          data: {
            newAssessment,
            links: {
              assessment: `http://localhost:3000/api/v1/assessments/detail/${newAssessment.id}`,
            },
          },
          message: 'Assessment created',
        },
        res,
      );
    }
  }

  @Get('/detail/:assessmentId')
  @UseGuards(
    JwtAuthGuard,
    new AuthorizationGuard([RoleEnum.HR, RoleEnum.CANDIDATE]),
  )
  async getDetailAssessment(
    @Param('assessmentId') assessmentId: number,
    @Res() res: Response,
  ) {
    const assessment = await this.assessmentService.getDetailAssessment(
      assessmentId,
    );

    if (assessment) {
      return this.successResponse(
        {
          data: {
            assessment,
          },
          message: 'success',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'Not exist this assessment',
        },
        res,
      );
    }
  }

  @Delete('/delete/:assessmentId')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.HR]))
  async deleteAssessment(
    @Param('assessmentId') assessmentId: number,
    @Res() res: Response,
  ) {
    const assessment = await this.assessmentService.deleteAssessment(
      assessmentId,
    );
    console.log('checckkdelete:::', assessment);
    if (assessment.affected) {
      return this.successResponse(
        {
          message: 'deleted success',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'This assessment is still existed',
        },
        res,
      );
    }
  }

  @Post('/invite')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.HR]))
  async inviteCandidates(
    @Body()
    candidateAssessmentDto: CandidateAssessmentDto,
    @Res() res: Response,
  ) {
    const invites = await this.assessmentService.inviteCandidates(
      candidateAssessmentDto,
    );

    const filteredInvites = invites.filter((invite) => invite !== null);

    if (filteredInvites.length > 0) {
      const data = {
        invites: filteredInvites,
        links: {
          update_password: 'http://localhost:3000/api/v1/user/update',
          login: 'http://localhost:3000/api/v1/login',
          assessment: `http://localhost:3000/api/v1/assessments/detail/${candidateAssessmentDto.assessmentId}`,
        },
      };

      // Send email for candidates
      for (const invite of filteredInvites) {
        const candidate = await this.assessmentService.getCandidateInformation(
          invite.candidateId,
        );
        console.log('check candidate::', candidate);
        this.mailService.sendInvitationEmail(candidate.email, data.links);
      }

      return this.successResponse(
        {
          data: data,
          message: 'invited success',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'Candidates are invited before',
        },
        res,
      );
    }
  }

  @Get('score/:assessmentId')
  @UseGuards(
    JwtAuthGuard,
    new AuthorizationGuard([RoleEnum.HR, RoleEnum.CANDIDATE]),
  )
  async calculateTotalScoreOfAssessment(
    @Param('assessmentId') assessmentId: number,
    @Res() res: Response,
  ) {
    const max_score =
      await this.assessmentService.calculateTotalScoreOfAssessment(
        assessmentId,
      );

    if (max_score) {
      return this.successResponse(
        {
          data: {
            total_score: max_score,
          },
          message: 'success',
        },
        res,
      );
    } else {
      throw new CustomizeException(this.i18n.t('message.ASSESSMENT_NOT_FOUND'));
    }
  }

  // @Patch('score/update')
  // @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.HR]))
  // async UpdateScoreCandidateAssessment(
  //   @Param('assessmentId') assessmentId: number,
  //   @Res() res: Response,
  // ) {
  //   const max_score =
  //     await this.assessmentService.UpdateScoreCandidateAssessment(assessmentId);

  //   if (max_score) {
  //     return this.successResponse(
  //       {
  //         data: {
  //           total_score: max_score,
  //         },
  //         message: 'success',
  //       },
  //       res,
  //     );
  //   } else {
  //     throw new CustomizeException(this.i18n.t('message.ASSESSMENT_NOT_FOUND'));
  //   }
  // }
}
