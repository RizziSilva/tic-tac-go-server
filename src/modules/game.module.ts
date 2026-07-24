import { Module } from '@nestjs/common';
import { GameGateway } from '@gateways';
import { GameService } from '@services';

@Module({
  providers: [GameGateway, GameService],
})
export class GameModule {}
