import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';

@Injectable()
export class UtilService {
  private randomInt(max: number): number {
  return randomInt(0, max);
}

  fisherYatesShuffle<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.randomInt(i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  getRandomGoals(min: number = 0, max: number = 5): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getRandomWinner(): 'home' | 'away' | 'draw' {
    const random = Math.random();
    if (random < 0.4) return 'home';
    if (random < 0.8) return 'away';
    return 'draw';
  }
}