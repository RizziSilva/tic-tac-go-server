import { PlayerSymbol, RoomStatus } from '@types';
import { Player } from './player.entity';
import { BOARD_SIZE, MAX_PIECES_PER_PLAYER, ROOM_STATUS_WAITING } from '@constants';

export class Room {
  readonly code: string;
  readonly isPublic: boolean;
  readonly maxPiecesPerPlayer: number = MAX_PIECES_PER_PLAYER;

  status: RoomStatus = ROOM_STATUS_WAITING;
  players: Player[] = [];
  moveQueues: Record<PlayerSymbol, number[]> = { X: [], O: [] };
  currentTurn: PlayerSymbol = 'X';
  winner: PlayerSymbol | null = null;
  board: (PlayerSymbol | null)[] = Array<PlayerSymbol | null>(BOARD_SIZE).fill(null);

  constructor(code: string, hostSocketId: string, isPublic: boolean) {
    this.code = code;
    this.isPublic = isPublic;
    this.players.push({ socketId: hostSocketId, symbol: 'X' });
  }
}
