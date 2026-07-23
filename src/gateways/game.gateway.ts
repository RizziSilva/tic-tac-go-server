import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway({ cors: { origin: 'http://localhost:5173' } })
export class GameGateway {
  @WebSocketServer()
  server;

  @SubscribeMessage('message')
  handleSomething(@MessageBody() message: string) {
    this.server.emit('message', message);
  }
}
