import {
  Controller,
  Post,
  UseGuards,
  Body,
  Res,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { BaseController } from '@modules/app/base.controller';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import { AuthorizationGuard } from '@guards/authorization.guard';
import { RoleEnum } from '@common/enum/role.enum';
import { Response } from 'express';
import { AssessmentGamesService } from '../services/assessment-game.service';
import { CreateAssessmentGameDto } from '../dto/create-assessment-game.dto';
import { AssessmentsService } from '@modules/assessments/services/assessment.service';
import { DeleteAssessmentGameDto } from '../dto/delete-assessment-game.dto';
import {
  ADD_GAME_TO_ASSESSMENT,
  DELETE_ASSESSMENT_GAME,
  GET_ALL_GAMES_IN_ASSESSMENT,
} from '@shared/constant/constants';

@Controller('api/v1/assessment-games')
export class AssessmentGamesController extends BaseController {
  constructor(
    private readonly assessmentGameService: AssessmentGamesService,
    private readonly assessmentService: AssessmentsService,
  ) {
    super();
  }

  @Post('/create')
  @UseGuards(JwtAuthGuard, new AuthorizationGuard([RoleEnum.HR]))
  async addGameToAssessment(
    @Body() createAssessmentGameDto: CreateAssessmentGameDto,
    @Res() res: Response,
  ) {
    const new_assessment_game =
      await this.assessmentGameService.createAssessmentGame(
        createAssessmentGameDto,
      );

    if (new_assessment_game) {
      await this.assessmentService.updateScoreAssessment(
        createAssessmentGameDto.assessmentId,
      );

      return this.successResponse(
        {
          data: {
            new_assessment_game,
            links: {
              add_game_to_assessment: ADD_GAME_TO_ASSESSMENT,
              get_games_in_assessment: GET_ALL_GAMES_IN_ASSESSMENT,
              delete_game_in_assessment: DELETE_ASSESSMENT_GAME,
            },
          },
          message: 'Add game to assessment success',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'This game have been added to this assessment',
        },
        res,
      );
    }
  }

  @Get('/:assessmentId')
  @UseGuards(
    JwtAuthGuard,
    new AuthorizationGuard([RoleEnum.HR, RoleEnum.CANDIDATE]),
  )
  async getAllGamesInAssessment(
    @Param('assessmentId') assessmentId: number,
    @Res() res: Response,
  ) {
    const games = await this.assessmentGameService.getAllGamesInAssessment(
      assessmentId,
    );

    if (games) {
      return this.successResponse(
        {
          data: {
            games,
            links: {
              add_game_to_assessment: ADD_GAME_TO_ASSESSMENT,
              get_games_in_assessment: GET_ALL_GAMES_IN_ASSESSMENT,
              delete_game_in_assessment: DELETE_ASSESSMENT_GAME,
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
  async deleteAssessmentGame(
    @Param('assessmentId') assessmentId: number,
    @Body() deleteAssessmentGameDto: DeleteAssessmentGameDto,
    @Res() res: Response,
  ) {
    const delete_assessment_game =
      await this.assessmentGameService.deleteAssessmentGame(
        assessmentId,
        deleteAssessmentGameDto,
      );

    if (delete_assessment_game.affected) {
      await this.assessmentService.updateScoreAssessment(assessmentId);

      return this.successResponse(
        {
          data: {
            links: {
              add_game_to_assessment: ADD_GAME_TO_ASSESSMENT,
              get_games_in_assessment: GET_ALL_GAMES_IN_ASSESSMENT,
              delete_game_in_assessment: DELETE_ASSESSMENT_GAME,
            },
          },
          message: 'delete success',
        },
        res,
      );
    } else {
      return this.errorsResponse(
        {
          message: 'delete failed',
        },
        res,
      );
    }
  }
}
