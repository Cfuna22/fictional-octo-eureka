import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
   HttpModule,
  ],
  controllers: [QueueController],
  providers: [QueueService, WhatsAppService],
  exports: [QueueService],
})
export class QueueModule {}
