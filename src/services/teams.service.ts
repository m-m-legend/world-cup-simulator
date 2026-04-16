import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { UtilService } from './util.service';

export interface Team {
  id: string;
  name: string;
}

export interface GroupTeam extends Team {
  group: string;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface Group {
  name: string;
  teams: GroupTeam[];
}

@Injectable()
export class TeamsService {
  private readonly API_URL = 'https://development-internship-api.geopostenergy.com/WorldCup/GetAllTeams';
  private readonly GIT_USER = 'm-m-legend';

  constructor(private utilService: UtilService) {}
  
  async getAllTeams(): Promise<Team[]> {
    const response = await axios.get(this.API_URL, {
      headers: { 'git-user': this.GIT_USER },
    });

    return response.data.map((team: any) => ({
      id: team.token,
      name: team.nome,
    }));
  }

  createGroups(teams: Team[]): Map<string, GroupTeam[]> {
    const groups = new Map<string, GroupTeam[]>();
    const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    // Embaralha os times
    const shuffledTeams = this.utilService.fisherYatesShuffle(teams);

    // Distribui em 8 grupos de 4 times cada
    groupLetters.forEach((letter, groupIndex) => {
      const groupTeams: GroupTeam[] = [];
      for (let i = 0; i < 4; i++) {
        const teamIndex = groupIndex * 4 + i;
        const team = shuffledTeams[teamIndex];
        groupTeams.push({
          id: team.id,
          name: team.name,
          group: letter,
          points: 0,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
        });
      }
      groups.set(letter, groupTeams);
    });

    return groups;
  }

  getGroupStandings(groupTeams: GroupTeam[]): GroupTeam[] {
    return groupTeams.sort((a, b) => {
      // Critério 1: Pontos
      if (a.points !== b.points) {
        return b.points - a.points;
      }

      // Critério 2: Saldo de gols
      const aGoalDiff = a.goalsFor - a.goalsAgainst;
      const bGoalDiff = b.goalsFor - b.goalsAgainst;
      if (aGoalDiff !== bGoalDiff) {
        return bGoalDiff - aGoalDiff;
      }

      // Critério 3: Gols marcados
      if (a.goalsFor !== b.goalsFor) {
        return b.goalsFor - a.goalsFor;
      }

      // Critério 4: Sorteio aleatório
      return Math.random() - 0.5;
    });
  }
}