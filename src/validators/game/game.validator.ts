import { Room } from '@entities';
import { MAX_PLAYERS_PER_ROOM } from '@constants';
import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class GameValidator {
  validateJoinRoomWithCode(room: Room | undefined): asserts room is Room {
    if (!room) throw new WsException('Room not found');
    if (room.players.length >= MAX_PLAYERS_PER_ROOM) {
      throw new WsException('Room is full');
    }
  }
}
