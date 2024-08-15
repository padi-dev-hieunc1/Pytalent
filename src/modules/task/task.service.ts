// import { GameResultStatusEnum } from '@common/enum/game-result-status.enum';
// import { GameResultsRepository } from '@modules/results/repositories/result.repository';
// import { GameResultsService } from '@modules/results/services/result.service';
// import { Injectable } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
// import { I18nService } from 'nestjs-i18n';

// @Injectable()
// export class TasksService {
//   constructor(
//     private gameResultRepository: GameResultsRepository,
//     private gameResultService: GameResultsService,
//     private readonly i18n: I18nService,
//   ) {}

//   async checkTime() {
//     const game_results = await this.gameResultRepository.find({
//       where: {
//         status: GameResultStatusEnum.NOT_COMPLETED,
//       },
//     });

//     for (const game_result of game_results) {
//       const current = new Date();
//       const diff_time =
//         (current.getTime() - game_result.updated_at.getTime()) / 1000;
//       const remain_time = 90 - game_result.complete_time;
//       if (diff_time > remain_time) {
//         console.log('check time1:', diff_time);
//         console.log('check time2:', remain_time);
//         this.gameResultService.completeGame(game_result.id);
//       }
//     }
//   }

//   @Cron(CronExpression.EVERY_5_SECONDS)
//   handleCron() {
//     console.log('Called');
//     this.checkTime();
//   }
// }
