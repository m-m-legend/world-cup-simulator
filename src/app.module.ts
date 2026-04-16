import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { CupService } from './services/cup.service';
import { TeamsService } from './services/teams.service';
import { MatchService } from './services/match.service';
import { UtilService } from './services/util.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  controllers: [AppController],
  providers: [CupService, TeamsService, MatchService, UtilService],
})
export class AppModule {}