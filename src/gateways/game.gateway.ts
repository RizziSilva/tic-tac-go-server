import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GameService } from '@services';

@WebSocketGateway({ cors: { origin: 'http://localhost:5173' } })
export class GameGateway {
  @WebSocketServer()
  server;

  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage('create_room')
  async handleCreateRoom(@ConnectedSocket() client: Socket) {
    const room = this.gameService.createRoom(client.id, false);
    await client.join(room.code);
    client.emit('room_created', room);
  }

  @SubscribeMessage('message')
  handleSomething(@MessageBody() message: string) {
    this.server.emit('message', message);
  }
}
