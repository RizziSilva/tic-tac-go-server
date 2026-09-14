import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Room } from '@entities';
import {
  CREATE_ROOM,
  GAME_OVER,
  JOIN_ROOM_WITH_CODE,
  LEAVE_ROOM,
  MOVE,
  MOVE_MADE,
  OPPONENT_DISCONNECTED,
  OPPONENT_RECONNECTED,
  PLAYER_JOINED,
  REJOIN_ROOM,
  ROOM_CREATED,
  ROOM_JOINED,
  ROOM_STATE,
  ROOM_STATUS_FINISHED,
} from '@constants';
import { GameService } from '@services';

@WebSocketGateway({ cors: { origin: 'http://localhost:5173' } })
export class GameGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly gameService: GameService) {
    [GAME_OVER, OPPONENT_DISCONNECTED, OPPONENT_RECONNECTED].forEach((event) => {
      this.gameService.events.on(event, ({ code, room }: { code: string; room: Room }) => {
        this.server.to(code).emit(event, room);
      });
    });
  }

  handleDisconnect(client: Socket) {
    this.gameService.handleSocketDisconnect(client.id);
  }

  @SubscribeMessage(CREATE_ROOM)
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('playerId') playerId: string,
    @MessageBody('name') name: string,
    @MessageBody('imageUrl') imageUrl: string,
  ) {
    const room = this.gameService.createRoom(playerId, client.id, name, imageUrl, false);
    await client.join(room.code);
    client.emit(ROOM_CREATED, room);
  }

  @SubscribeMessage(JOIN_ROOM_WITH_CODE)
  async handleJoinRoomWithCode(
    @ConnectedSocket() client: Socket,
    @MessageBody('playerId') playerId: string,
    @MessageBody('name') name: string,
    @MessageBody('imageUrl') imageUrl: string,
    @MessageBody('code') code: string,
  ) {
    const room = this.gameService.joinRoomWithCode(playerId, client.id, name, imageUrl, code);
    await client.join(room.code);
    client.emit(ROOM_JOINED, room);
    client.to(room.code).emit(PLAYER_JOINED, room);
  }

  @SubscribeMessage(REJOIN_ROOM)
  async handleRejoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody('playerId') playerId: string,
    @MessageBody('code') code: string,
  ) {
    await client.join(code);

    const room = this.gameService.rejoinRoom(playerId, client.id, code);

    this.server.to(room.code).emit(ROOM_STATE, room);
  }

  @SubscribeMessage(LEAVE_ROOM)
  async handleLeaveRoom(@ConnectedSocket() client: Socket) {
    const code = this.gameService.leaveRoom(client.id);

    await client.leave(code);
  }

  @SubscribeMessage(MOVE)
  handleMove(@ConnectedSocket() client: Socket, @MessageBody('position') position: number) {
    const room = this.gameService.move(client.id, position);

    this.server.to(room.code).emit(MOVE_MADE, room);

    const isGameFinished: boolean = room.status === ROOM_STATUS_FINISHED;

    if (isGameFinished) this.server.to(room.code).emit(GAME_OVER, room);
  }
}
