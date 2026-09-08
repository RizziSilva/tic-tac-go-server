import { PlayerSymbol } from '@types';

export class Player {
  playerId: string;
  socketId: string;
  symbol: PlayerSymbol;

  constructor(playerId: string, socketId: string, symbol: PlayerSymbol) {
    this.playerId = playerId;
    this.socketId = socketId;
    this.symbol = symbol;
  }
}
