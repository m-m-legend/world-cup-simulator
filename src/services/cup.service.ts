import { Injectable } from '@nestjs/common';
import { TeamsService, GroupTeam } from './teams.service';
import { MatchService, Match } from './match.service';
import axios from 'axios';

export interface CupState {
  groups: Map<string, GroupTeam[]>;
  groupMatches: Match[];
  knockoutMatches: Match[];
  champions: GroupTeam | null;
  runnerUp: GroupTeam | null;
}

@Injectable()
export class CupService {
  private cupState: CupState = {
    groups: new Map(),
    groupMatches: [],
    knockoutMatches: [],
    champions: null,
    runnerUp: null,
  };

  private readonly API_URL = 'https://development-internship-api.geopostenergy.com/WorldCup/FinalResult';
  private readonly GIT_USER = 'm-m-legend';

  constructor(
    private teamsService: TeamsService,
    private matchService: MatchService,
  ) {}

  async initializeAndRun(): Promise<CupState> {
    this.resetState();
    // ORDEM LÓGICA
    // 1. Busca todas as seleções
    const teams = await this.teamsService.getAllTeams();

    // 2. Cria os grupos
    this.cupState.groups = this.teamsService.createGroups(teams);

    // 3. Gera e simula partidas de grupos
    await this.runGroupStage();

    // 4. Gera e simula oitavas até final
    await this.runKnockoutStage();

    // 5. Envia resultado final para API
    await this.submitFinalResult();

    return this.cupState;
  }

  private resetState() {
    this.cupState = {
      groups: new Map(),
      groupMatches: [],
      knockoutMatches: [],
      champions: null,
      runnerUp: null,
    };
  }
  private async runGroupStage(): Promise<void> {
    // Para cada grupo, gera e simula as partidas
    for (const [groupName, teams] of this.cupState.groups) {
      const matches = this.matchService.generateGroupMatches(teams, groupName);

      // Simula cada partida
      matches.forEach((match) => {
        const simulatedMatch = this.matchService.simulateMatch(match);
        this.cupState.groupMatches.push(simulatedMatch);
      });

      // Atualiza o ranking final do grupo
      const standings = this.teamsService.getGroupStandings(teams);
      this.cupState.groups.set(groupName, standings);
    }
  }

  private async runKnockoutStage(): Promise<void> {
    // Pega os 2 primeiros de cada grupo
    const qualified: GroupTeam[] = [];
    const groupOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    for (const groupName of groupOrder) {
      const group = this.cupState.groups.get(groupName);
      if (group) {
        qualified.push(group[0]); // 1º lugar
        qualified.push(group[1]); // 2º lugar
      }
    }

    // Separa em primeiros e segundos lugares
    const firstPlaces = qualified.filter((_, i) => i % 2 === 0);
    const secondPlaces = qualified.filter((_, i) => i % 2 !== 0);

    // Oitavas de final
    let roundMatches = this.matchService.generateKnockoutMatches(
      firstPlaces,
      secondPlaces,
      'Oitavas',
    );

    let simulatedMatches = roundMatches.map((match) => {
      const simulated = this.matchService.simulateKnockoutMatch(match);
      this.cupState.knockoutMatches.push(simulated);
      return simulated;
    });

    let winners = this.extractWinners(simulatedMatches);

    // Quartas de final
    roundMatches = this.generateSimpleKnockout(winners, 'Quartas');

    simulatedMatches = roundMatches.map((match) => {
      const simulated = this.matchService.simulateKnockoutMatch(match);
      this.cupState.knockoutMatches.push(simulated);
      return simulated;
    });

    winners = this.extractWinners(simulatedMatches);

    // Semifinal
    roundMatches = this.generateSimpleKnockout(winners, 'Semifinal');

    simulatedMatches = roundMatches.map((match) => {
      const simulated = this.matchService.simulateKnockoutMatch(match);
      this.cupState.knockoutMatches.push(simulated);
      return simulated;
    });

    winners = this.extractWinners(simulatedMatches);

    // Final
    roundMatches = this.generateSimpleKnockout(winners, 'Final');

    if (roundMatches.length === 0) {
      console.error('Erro: final não gerada corretamente');
      return;
    }

    const simulatedFinal = this.matchService.simulateKnockoutMatch(roundMatches[0]);
    this.cupState.knockoutMatches.push(simulatedFinal);

    // Garante que há vencedor
    if (!simulatedFinal.winner) {
      console.error('Erro: final sem vencedor');
      return;
  }

    this.cupState.champions =
      simulatedFinal.winner === 'home'
        ? simulatedFinal.homeTeam
        : simulatedFinal.awayTeam;

    this.cupState.runnerUp =
      simulatedFinal.winner === 'home'
        ? simulatedFinal.awayTeam
        : simulatedFinal.homeTeam;
}
  private extractWinners(matches: Match[]): GroupTeam[] {
    return matches
      .filter((m) => m.finished)
      .map((m) => (m.winner === 'home' ? m.homeTeam : m.awayTeam));
  }

  private generateSimpleKnockout(teams: GroupTeam[], round: string): Match[] {
    const matches: Match[] = [];
    for (let i = 0; i < teams.length; i += 2) {
      if (!teams[i + 1]) continue;
      matches.push({
        id: `${round}-${i / 2}`,
        homeTeam: teams[i],
        awayTeam: teams[i + 1],
        homeGoals: 0,
        awayGoals: 0,
        round: round,
        finished: false,
      });
    }
    return matches;
  }

  private async submitFinalResult(): Promise<void> {
    if (!this.cupState.champions) {
      console.error('Campeão não identificado');
      return;
    }

    const finalMatch = this.cupState.knockoutMatches.find((m) => m.round === 'Final');

    const payload = {
      equipeA: this.cupState.champions.id,
      equipeB: this.cupState.runnerUp?.id,
      golsEquipeA: finalMatch?.homeTeam.id === this.cupState.champions.id ? finalMatch?.homeGoals : finalMatch?.awayGoals,
      golsEquipeB: finalMatch?.homeTeam.id === this.cupState.champions.id ? finalMatch?.awayGoals : finalMatch?.homeGoals,
      golsPenaltyTimeA: finalMatch?.penaltiesHome || 0,
      golsPenaltyTimeB: finalMatch?.penaltiesAway || 0,
    };

    try {
      const response = await axios.post(this.API_URL, payload, {
        headers: {
          'git-user': this.GIT_USER,
          'Content-Type': 'application/json',
        },
      });
      console.log('✅ Status:', response.status);
      console.log('✅ Response:', response.data);
      console.log('Resultado final enviado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao enviar resultado final:', error);
    }
  }

  getState(): CupState {
    return this.cupState;
  }
}