import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ROOM_STATUS_FINISHED } from '@constants';
import { GameService } from '@services';

@WebSocketGateway({ cors: { origin: 'http://localhost:5173' } })
export class GameGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage('create_room')
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('playerId') playerId: string,
  ) {
    const room = this.gameService.createRoom(playerId, client.id, false);
    await client.join(room.code);
    client.emit('room_created', room);
  }

  @SubscribeMessage('join_room_with_code')
  async handleJoinRoomWithCode(
    @ConnectedSocket() client: Socket,
    @MessageBody('playerId') playerId: string,
    @MessageBody('code') code: string,
  ) {
    const room = this.gameService.joinRoomWithCode(playerId, client.id, code);
    await client.join(room.code);
    client.emit('room_joined', room);
    client.to(room.code).emit('player_joined', room);
  }

  @SubscribeMessage('rejoin_room')
  async handleRejoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('playerId') playerId: string,
    @MessageBody('code') code: string,
  ) {
    const room = this.gameService.rejoinRoom(playerId, client.id, code);
    await client.join(room.code);
    client.emit('room_state', room);
  }

  @SubscribeMessage('move')
  handleMove(@ConnectedSocket() client: Socket, @MessageBody('position') position: number) {
    const room = this.gameService.move(client.id, position);

    this.server.to(room.code).emit('move_made', room);

    const isGameFinished: boolean = room.status === ROOM_STATUS_FINISHED;

    if (isGameFinished) this.server.to(room.code).emit('game_over', room);
  }
}
