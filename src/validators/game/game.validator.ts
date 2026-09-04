import { Room } from '@entities';
import { BOARD_SIZE, MAX_PLAYERS_PER_ROOM, ROOM_STATUS_PLAYING } from '@constants';
import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class GameValidator {
  validateJoinRoomWithCode(room: Room | undefined): asserts room is Room {
    if (!room) throw new WsException('Room not found');
    if (room.players.length >= MAX_PLAYERS_PER_ROOM) throw new WsException('Room is full');
  }

  validateMove(
    room: Room | undefined,
    playerSocketId: string,
    position: number,
  ): asserts room is Room {
    if (!room) throw new WsException('Room not found');
    if (room.status !== ROOM_STATUS_PLAYING) throw new WsException('Game is not in progress');

    const player = room.players.find((current) => current.socketId === playerSocketId);

    if (!player) throw new WsException('Player is not in this room');
    if (player.symbol !== room.currentTurn) throw new WsException('It is not your turn');
    const isValidPosition: boolean =
      Number.isInteger(position) && position >= 0 && position < BOARD_SIZE;

    if (!isValidPosition) throw new WsException('Invalid board position');
    if (room.board[position] !== null) throw new WsException('Position already taken');
  }
}
