import { PlayerSymbol } from '@types';

export class Player {
  socketId: string;
  symbol: PlayerSymbol;

  constructor(socketId: string, symbol: PlayerSymbol) {
    this.socketId = socketId;
    this.symbol = symbol;
  }
}
