import { PlayerSymbol } from '@types';

export class Player {
  playerId: string;
  socketId: string;
  symbol: PlayerSymbol;
  name: string;
  imageUrl: string;

  constructor(
    playerId: string,
    socketId: string,
    symbol: PlayerSymbol,
    name: string,
    imageUrl: string,
  ) {
    this.playerId = playerId;
    this.socketId = socketId;
    this.symbol = symbol;
    this.name = name;
    this.imageUrl = imageUrl;
  }
}
