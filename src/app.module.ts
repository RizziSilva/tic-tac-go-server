import { Module } from '@nestjs/common';
import { GameModule } from '@modules';

@Module({
  imports: [GameModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
