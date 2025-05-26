import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageGateway } from './message-events/message.gateway';

@Module({
  imports: [ConfigModule.forRoot({})],
  controllers: [AppController],
  providers: [AppService, MessageGateway],
})
export class AppModule {}
