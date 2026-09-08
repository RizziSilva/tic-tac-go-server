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

  validateRejoinRoom(room: Room | undefined, playerId: string): asserts room is Room {
    if (!room) throw new WsException('Room not found');

    const player = room.players.find((current) => current.playerId === playerId);

    if (!player) throw new WsException('Player is not in this room');
  }

  validateMove(
    room: Room | undefined,
    playerSocketId: string,
    position: number,
  ): asserts room is Room {
    if (!room) throw new WsException('Room not found');

    const isGameInProgress = room.status === ROOM_STATUS_PLAYING;

    if (!isGameInProgress) throw new WsException('Game is not in progress');

    const player = room.players.find((current) => current.socketId === playerSocketId);

    if (!player) throw new WsException('Player is not in this room');

    const isCurrentPlayerTurn = player.symbol === room.currentTurn;

    if (!isCurrentPlayerTurn) throw new WsException('It is not your turn');

    const isValidPosition: boolean =
      Number.isInteger(position) && position >= 0 && position < BOARD_SIZE;

    if (!isValidPosition) throw new WsException('Invalid board position');

    const isPositionOpen = room.board[position] === null;
    if (isPositionOpen) throw new WsException('Position already taken');
  }
}
