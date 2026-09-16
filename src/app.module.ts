import { Module } from '@nestjs/common';
import { GameModule } from '@modules';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), GameModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
