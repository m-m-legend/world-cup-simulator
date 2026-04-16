import { Controller, Get, Post, Res } from '@nestjs/common';
import { CupService } from './services/cup.service';

@Controller('api')
export class AppController {
  constructor(private cupService: CupService) {}

  @Get('simulate')
  async simulate() {
    const result = await this.cupService.initializeAndRun();
    return {
      success: true,
      champions: result.champions,
      runnerUp: result.runnerUp,
    };
  }

  @Get('state')
  getState() {
    const state = this.cupService.getState();
    return {
      groups: Array.from(state.groups.entries()).map(([name, teams]) => ({
        name,
        teams,
      })),
      groupMatches: state.groupMatches,
      knockoutMatches: state.knockoutMatches,
      champions: state.champions,
      runnerUp: state.runnerUp,
    };
  }
}