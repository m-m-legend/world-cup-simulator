import { Injectable } from '@nestjs/common';
import { UtilService } from './util.service';
import { GroupTeam } from './teams.service';

export interface Match {
  id: string;
  homeTeam: GroupTeam;
  awayTeam: GroupTeam;
  homeGoals: number;
  awayGoals: number;
  homeGoalsOvertime?: number;
  awayGoalsOvertime?: number;
  penaltiesHome?: number;
  penaltiesAway?: number;
  winner?: 'home' | 'away';
  round: string;
  finished: boolean;
}

@Injectable()
export class MatchService {
  constructor(private utilService: UtilService) {}

  generateGroupMatches(groupTeams: GroupTeam[], groupName: string): Match[] {
    const matches: Match[] = [];
    const [team1, team2, team3, team4] = groupTeams;

    // Rodada 1
    matches.push(this.createMatch(team1, team2, `${groupName}-R1-1`));
    matches.push(this.createMatch(team3, team4, `${groupName}-R1-2`));

    // Rodada 2
    matches.push(this.createMatch(team1, team3, `${groupName}-R2-1`));
    matches.push(this.createMatch(team2, team4, `${groupName}-R2-2`));

    // Rodada 3
    matches.push(this.createMatch(team1, team4, `${groupName}-R3-1`));
    matches.push(this.createMatch(team2, team3, `${groupName}-R3-2`));

    return matches;
  }

  private createMatch(homeTeam: GroupTeam, awayTeam: GroupTeam, matchId: string): Match {
    return {
      id: matchId,
      homeTeam,
      awayTeam,
      homeGoals: 0,
      awayGoals: 0,
      round: 'group',
      finished: false,
    };
  }

  simulateMatch(match: Match): Match {
    const simulatedMatch = { ...match };

    // Simula resultado da partida
    const winner = this.utilService.getRandomWinner();
    let homeGoals = this.utilService.getRandomGoals(0, 4);
    let awayGoals = this.utilService.getRandomGoals(0, 4);

    if (winner === 'home' && homeGoals === awayGoals) {
      awayGoals = Math.max(0, homeGoals - 1);
    } else if (winner === 'away' && homeGoals === awayGoals) {
      homeGoals = Math.max(0, awayGoals - 1);
    }

    simulatedMatch.homeGoals = homeGoals;
    simulatedMatch.awayGoals = awayGoals;
    const matchWinner = this.determineWinner(homeGoals, awayGoals);
    simulatedMatch.winner = matchWinner === 'draw' ? undefined : matchWinner;
    simulatedMatch.finished = true;

    // Atualiza estatísticas dos times
    this.updateTeamStats(simulatedMatch);

    return simulatedMatch;
  }

  simulateKnockoutMatch(match: Match): Match {
    const simulatedMatch = { ...match };

    // Simula resultado da partida
    let homeGoals = this.utilService.getRandomGoals(0, 4);
    let awayGoals = this.utilService.getRandomGoals(0, 4);

    simulatedMatch.homeGoals = homeGoals;
    simulatedMatch.awayGoals = awayGoals;

    // Se empatou, vai para pênalti (extratime também, mas simplificamos)
    if (homeGoals === awayGoals) {
      simulatedMatch.penaltiesHome = this.utilService.getRandomGoals(3, 5);
      simulatedMatch.penaltiesAway = this.utilService.getRandomGoals(2, 4);

      // Garante que não haja empate nos pênaltis
      while (simulatedMatch.penaltiesHome === simulatedMatch.penaltiesAway) {
        simulatedMatch.penaltiesAway = this.utilService.getRandomGoals(2, 4);
      }

      simulatedMatch.winner =
        simulatedMatch.penaltiesHome > simulatedMatch.penaltiesAway ? 'home' : 'away';
    } else {
      simulatedMatch.winner = homeGoals > awayGoals ? 'home' : 'away';
    }

    simulatedMatch.finished = true;
    return simulatedMatch;
  }

  private determineWinner(homeGoals: number, awayGoals: number): 'home' | 'away' | 'draw' {
    if (homeGoals > awayGoals) return 'home';
    if (awayGoals > homeGoals) return 'away';
    return 'draw';
  }

  private updateTeamStats(match: Match): void {
    const homeTeam = match.homeTeam;
    const awayTeam = match.awayTeam;

    homeTeam.played += 1;
    awayTeam.played += 1;
    homeTeam.goalsFor += match.homeGoals;
    homeTeam.goalsAgainst += match.awayGoals;
    awayTeam.goalsFor += match.awayGoals;
    awayTeam.goalsAgainst += match.homeGoals;

    if (match.homeGoals > match.awayGoals) {
      homeTeam.wins += 1;
      homeTeam.points += 3;
      awayTeam.losses += 1;
    } else if (match.awayGoals > match.homeGoals) {
      awayTeam.wins += 1;
      awayTeam.points += 3;
      homeTeam.losses += 1;
    } else {
      homeTeam.draws += 1;
      awayTeam.draws += 1;
      homeTeam.points += 1;
      awayTeam.points += 1;
    }
  }

  generateKnockoutMatches(teams1: GroupTeam[], teams2: GroupTeam[], round: string): Match[] {
    const matches: Match[] = [];

    // Pareamento para oitavas
    const pairings = [
      [0, 0], // 1A x 2B
      [2, 2], // 1C x 2D
      [4, 4], // 1E x 2F
      [6, 6], // 1G x 2H
      [1, 1], // 1B x 2A
      [3, 3], // 1D x 2C
      [5, 5], // 1F x 2E
      [7, 7], // 1H x 2G
    ];

    pairings.forEach((pairing, index) => {
      const homeTeam = teams1[pairing[0]];
      const awayTeam = teams2[pairing[1]];

      if (homeTeam && awayTeam) {
        matches.push({
          id: `${round}-${index}`,
          homeTeam,
          awayTeam,
          homeGoals: 0,
          awayGoals: 0,
          round: round,
          finished: false,
        });
      }
    });

    return matches;
  }
}