import { Player, Room } from '@entities';
import { PlayerSymbol } from '@types';
import {
  DISCONNECT_GRACE_PERIOD_MS,
  GAME_OVER,
  OPPONENT_DISCONNECTED,
  OPPONENT_RECONNECTED,
  ROOM_STATUS_FINISHED,
  ROOM_STATUS_PLAYING,
  WINNING_LINES,
} from '@constants';
import { GameValidator } from '@validators';
import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

@Injectable()
export class GameService {
  readonly events = new EventEmitter();
  private rooms = new Map<string, Room>();
  private roomsSockets = new Map<string, string>();
  private disconnectTimers = new Map<string, NodeJS.Timeout>();

  constructor(private readonly gameValidator: GameValidator) {}

  createRoom(
    hostPlayerId: string,
    hostSocketId: string,
    hostName: string,
    hostImageUrl: string,
    isPublic: boolean,
  ) {
    return this.createEmptyRoom(hostPlayerId, hostSocketId, hostName, hostImageUrl, isPublic);
  }

  joinRoomWithCode(
    guestPlayerId: string,
    guestSocketId: string,
    guestName: string,
    guestImageUrl: string,
    code: string,
  ): Room {
    const room: Room | undefined = this.rooms.get(code);

    this.gameValidator.validateJoinRoomWithCode(room);

    room.players.push({
      playerId: guestPlayerId,
      socketId: guestSocketId,
      symbol: 'O',
      name: guestName,
      imageUrl: guestImageUrl,
    });
    this.roomsSockets.set(guestSocketId, code);
    room.status = ROOM_STATUS_PLAYING;

    return room;
  }

  rejoinRoom(playerId: string, socketId: string, code: string): Room {
    const room: Room | undefined = this.rooms.get(code);

    this.gameValidator.validateRejoinRoom(room, playerId);

    const player = room.players.find((current) => current.playerId === playerId) as Player;

    player.socketId = socketId;
    this.roomsSockets.set(socketId, code);

    if (this.cancelDisconnectTimer(playerId)) {
      this.events.emit(OPPONENT_RECONNECTED, { code: room.code, room });
    }

    return room;
  }

  leaveRoom(playerSocketId: string): string {
    const code: string | undefined = this.roomsSockets.get(playerSocketId);
    const room: Room | undefined = code ? this.rooms.get(code) : undefined;

    this.gameValidator.validateLeaveRoom(room, playerSocketId);

    this.removePlayerFromRoom(room, playerSocketId);

    return room.code;
  }

  handleSocketDisconnect(playerSocketId: string): void {
    const code: string | undefined = this.roomsSockets.get(playerSocketId);
    const room: Room | undefined = code ? this.rooms.get(code) : undefined;

    if (!room) return;

    const player = room.players.find((current) => current.socketId === playerSocketId);

    if (!player) return;

    this.roomsSockets.delete(playerSocketId);

    const timer = setTimeout(() => {
      this.disconnectTimers.delete(player.playerId);
      this.finalizeDisconnect(room.code, player.playerId, playerSocketId);
    }, DISCONNECT_GRACE_PERIOD_MS);

    this.disconnectTimers.set(player.playerId, timer);

    if (room.players.length > 1) {
      this.events.emit(OPPONENT_DISCONNECTED, { code: room.code, room });
    }
  }

  private finalizeDisconnect(code: string, playerId: string, disconnectedSocketId: string) {
    const room: Room | undefined = this.rooms.get(code);

    if (!room) return;

    const player = room.players.find((current) => current.playerId === playerId);
    const hasReconnected = !player || player.socketId !== disconnectedSocketId;

    if (hasReconnected) return;

    this.removePlayerFromRoom(room, disconnectedSocketId);
  }

  private cancelDisconnectTimer(playerId: string): boolean {
    const timer = this.disconnectTimers.get(playerId);

    if (!timer) return false;

    clearTimeout(timer);
    this.disconnectTimers.delete(playerId);

    return true;
  }

  private removePlayerFromRoom(room: Room, playerSocketId: string): void {
    room.players = room.players.filter((current) => current.socketId !== playerSocketId);
    this.roomsSockets.delete(playerSocketId);

    if (room.players.length === 0) {
      this.rooms.delete(room.code);

      return;
    }

    const isGameAlreadyFinished = room.status === ROOM_STATUS_FINISHED;

    if (!isGameAlreadyFinished) {
      const remainingPlayer = room.players[0] as Player;

      room.status = ROOM_STATUS_FINISHED;
      room.winner = remainingPlayer.symbol;
    }

    this.events.emit(GAME_OVER, { code: room.code, room });
  }

  move(playerSocketId: string, position: number): Room {
    const code: string | undefined = this.roomsSockets.get(playerSocketId);
    const room: Room | undefined = code ? this.rooms.get(code) : undefined;

    this.gameValidator.validateMove(room, playerSocketId, position);

    const symbol: PlayerSymbol = room.currentTurn;

    this.placePiece(room, symbol, position);

    if (this.hasWon(room, symbol)) {
      room.winner = symbol;
      room.status = ROOM_STATUS_FINISHED;
    } else {
      room.currentTurn = symbol === 'X' ? 'O' : 'X';
    }

    return room;
  }

  private placePiece(room: Room, symbol: PlayerSymbol, position: number) {
    const queue: number[] = room.moveQueues[symbol];

    queue.push(position);
    room.board[position] = symbol;

    if (queue.length > room.maxPiecesPerPlayer) {
      const removed: number = queue.shift() as number;

      room.board[removed] = null;
    }
  }

  private hasWon(room: Room, symbol: PlayerSymbol): boolean {
    return WINNING_LINES.some((line) => line.every((cell) => room.board[cell] === symbol));
  }

  private createEmptyRoom(
    hostPlayerId: string,
    hostSocketId: string,
    hostName: string,
    hostImageUrl: string,
    isPublic: boolean,
  ) {
    const randomCode: string = this.generateRandomCode();
    const room: Room = new Room(
      randomCode,
      hostPlayerId,
      hostSocketId,
      hostName,
      hostImageUrl,
      isPublic,
    );

    this.rooms.set(randomCode, room);
    this.roomsSockets.set(hostSocketId, randomCode);

    return room;
  }

  private generateRandomCode() {
    const randomNumber: number = Math.random();

    return randomNumber.toString().substring(2, 8).toUpperCase();
  }
}
