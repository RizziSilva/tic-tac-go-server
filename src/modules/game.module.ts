import { Module } from '@nestjs/common';
import { GameGateway } from '@gateways';
import { GameService } from '@services';
import { GameValidator } from '@validators';

@Module({
  providers: [GameGateway, GameService, GameValidator],
})
export class GameModule {}
