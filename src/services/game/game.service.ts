import { Room } from '@entities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
  private rooms = new Map<string, Room>();
  private roomsSockets = new Map<string, string>();

  createRoom(hostSocketId: string, isPublic: boolean) {
    return this.createEmptyRoom(hostSocketId, isPublic);
  }

  private createEmptyRoom(hostSocketId: string, isPublic: boolean) {
    const randomCode: string = this.generateRandomCode();
    const room: Room = new Room(randomCode, hostSocketId, isPublic);

    this.rooms.set(randomCode, room);
    this.roomsSockets.set(hostSocketId, randomCode);

    return room;
  }

  private generateRandomCode() {
    const randomNumber: number = Math.random();

    return randomNumber.toString().substring(2, 8).toUpperCase();
  }
}
