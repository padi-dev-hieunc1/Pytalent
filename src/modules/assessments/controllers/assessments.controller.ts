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
import { Response } from 'express';
import { AssessmentStatusEnum } from '@common/enum/assessment-status.enum';
import { MailService } from '@modules/mail/mail.service';
import { AssessmentsService } from '../services/assessment.service';
import { CreateAssessmentDto } from '../dto/create-assessment.dto';
import { CandidateAssessmentDto } from '../dto/candidate-assessment.dto';
import {
  CREATE_ASSESSMENT,
  DELETE_ASSESSMENT,
  GET_ASSESSMENTS_BY_HR_ID,
  GET_DETAIL_ASSESSMENT,
  INVITE_CANDIDATE,
  UPDATE_PASSWORD,
} from '@shared/constant/constants';
import { CandidateAssessmentStatusEnum } from '@common/enum/candidate-assessment-status.enum';
import { CustomizeException } from '@exception/customize.exception';

@Controller('api/v1/assessments')
export class AssessmentsController extends BaseController {
  constructor(
    private readonly assessmentService: AssessmentsService,
    private readonly mailService: MailService,
  ) {
    super();
  }

  @Post('/create')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.HR]))
  async createAssessment(
    @Body() createAssessmentDto: CreateAssessmentDto,
    @Res() res: Response,
  ) {
    const new_assessment = await this.assessmentService.createAssessment(
      createAssessmentDto,
    );

    if (
      new_assessment &&
      new_assessment.status !== AssessmentStatusEnum.EXPIRED
    ) {
      return this.successResponse(
        {
          data: {
            new_assessment,
            links: {
              create_assessment: CREATE_ASSESSMENT,
              get_assessments_by_hr_id: GET_ASSESSMENTS_BY_HR_ID,
              get_detail_assessment: GET_DETAIL_ASSESSMENT,
              delete_assessment: DELETE_ASSESSMENT,
              invite_candidate: INVITE_CANDIDATE,
              update_password: UPDATE_PASSWORD,
            },
          },
          message: 'Assessment created',
        },
        res,
      );
    }
  }

  @Get('/:hrId')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.HR]))
  async getAllAssessmentsByHrId(
    @Param('hrId') hrId: number,
    @Res() res: Response,
  ) {
    const assessments = await this.assessmentService.getAllAssessmentsByHrId(
      hrId,
    );

    if (assessments.length > 0) {
      // Have 2 options: remove expired assessment immediately -> return in updateStatusAssessment -> if ok push new array
      // or set assessment's status to expired -> set status -> still get all assessment include expired assessment

      for (const assessment of assessments) {
        if (assessment && assessment.end_time) {
          await this.assessmentService.updateStatusAssessment(assessment.id);
        }
      }

      const updated_assessments =
        await this.assessmentService.getAllAssessmentsByHrId(hrId);

      return this.successResponse(
        {
          data: {
            updated_assessments,
            links: {
              create_assessment: CREATE_ASSESSMENT,
              get_assessments_by_hr_id: GET_ASSESSMENTS_BY_HR_ID,
              get_detail_assessment: GET_DETAIL_ASSESSMENT,
              delete_assessment: DELETE_ASSESSMENT,
              invite_candidate: INVITE_CANDIDATE,
              update_password: UPDATE_PASSWORD,
            },
          },
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
            links: {
              create_assessment: CREATE_ASSESSMENT,
              get_assessments_by_hr_id: GET_ASSESSMENTS_BY_HR_ID,
              get_detail_assessment: GET_DETAIL_ASSESSMENT,
              delete_assessment: DELETE_ASSESSMENT,
              invite_candidate: INVITE_CANDIDATE,
              update_password: UPDATE_PASSWORD,
            },
          },
          message: 'success',
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

    if (assessment.affected) {
      return this.successResponse(
        {
          data: {
            links: {
              create_assessment: CREATE_ASSESSMENT,
              get_assessments_by_hr_id: GET_ASSESSMENTS_BY_HR_ID,
              get_detail_assessment: GET_DETAIL_ASSESSMENT,
              delete_assessment: DELETE_ASSESSMENT,
              invite_candidate: INVITE_CANDIDATE,
              update_password: UPDATE_PASSWORD,
            },
          },
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
      // Send email for candidates
      for (const invite of filteredInvites) {
        const candidate = await this.assessmentService.getCandidateInformation(
          invite.candidateId,
        );

        this.mailService.sendInvitationEmail(candidate.email);
      }

      return this.successResponse(
        {
          data: {
            invites: filteredInvites,
            links: {
              create_assessment: CREATE_ASSESSMENT,
              get_assessments_by_hr_id: GET_ASSESSMENTS_BY_HR_ID,
              get_detail_assessment: GET_DETAIL_ASSESSMENT,
              delete_assessment: DELETE_ASSESSMENT,
              invite_candidate: INVITE_CANDIDATE,
              update_password: UPDATE_PASSWORD,
            },
          },
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

  @Patch('/update-confirm/:candidateId/:assessmentId')
  @UseGuards(
    JwtAuthGuard,
    new AuthorizationGuard([RoleEnum.HR, RoleEnum.CANDIDATE]),
  )
  async updateCandidateAssessment(
    @Param('candidateId') candidateId: number,
    @Param('assessmentId') assessmentId: number,
    @Res() res: Response,
  ) {
    const update_confirm =
      await this.assessmentService.updateCandidateAssessment(
        candidateId,
        assessmentId,
      );

    const confirm = update_confirm.status;

    if (confirm === CandidateAssessmentStatusEnum.COMPLETED) {
      return this.successResponse(
        {
          data: {
            confirm: confirm,
          },
          message: 'Completed assessment',
        },
        res,
      );
    } else if (confirm === CandidateAssessmentStatusEnum.PROCESSING) {
      return this.successResponse(
        {
          data: {
            confirm: confirm,
          },
          message: 'Process assessment',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          data: {},
          message: 'Update failed',
        },
        res,
      );
    }
  }
}
