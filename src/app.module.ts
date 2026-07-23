import { Module } from '@nestjs/common';
import { AppController } from './controllers';
import { AppService } from './services';
import { GameGateway } from './gateways';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, GameGateway],
})
export class AppModule {}
