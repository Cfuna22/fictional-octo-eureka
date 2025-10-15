// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Query,
//   Logger
// } from '@nestjs/common';
// import { WhatsAppService } from './whatsapp.service';

// @Controller('whatsapp')
// export class WhatsAppController {
//   private readonly logger = new Logger(WhatsAppController.name);

//   constructor(private readonly whatsappService: WhatsAppService) {}

//   /**
//    * Test WhatsApp connection with a specific phone number
//    */
//   @Get('test')
//   async testConnection(@Query('phone') phone: string) {
//     this.logger.log(`🧪 Testing WhatsApp connection to: ${phone}`);

//     if (!phone) {
//       return {
//         success: false,
//         error: 'Phone number is required. Use ?phone=+234712345678'
//       };
//     }

//     try {
//       const result = await this.whatsappService.testConnection(phone);
//       return {
//         success: true,
//         message: 'WhatsApp test message sent successfully!',
//         data: result
//       };
//     } catch (error: any) {
//       return {
//         success: false,
//         error: error.response?.data?.error?.message || error.message,
//         details: error.response?.data
//       };
//     }
//   }

//   /**
//    * Verify WhatsApp credentials and account status
//    */
//   @Get('verify')
//   async verifyCredentials() {
//     this.logger.log('🔐 Verifying WhatsApp credentials...');

//     try {
//       const result = await this.whatsappService.verifyCredentials();
//       return {
//         success: true,
//         message: 'WhatsApp credentials are valid!',
//         data: result
//       };
//     } catch (error: any) {
//       return {
//         success: false,
//         error: error.response?.data?.error?.message || error.message,
//         details: error.response?.data
//       };
//     }
//   }

//   /**
//    * Send a custom text message
//    */
//   @Post('send-text')
//   async sendTextMessage(
//     @Body() body: { phone: string; message: string }
//   ) {
//     const { phone, message } = body;

//     if (!phone || !message) {
//       return {
//         success: false,
//         error: 'Phone and message are required'
//       };
//     }

//     this.logger.log(`📤 Sending text message to: ${phone}`);

//     try {
//       const result = await this.whatsappService.sendTextMessage(phone, message);
//       return {
//         success: true,
//         message: 'Text message sent successfully!',
//         data: result
//       };
//     } catch (error: any) {
//       return {
//         success: false,
//         error: error.response?.data?.error?.message || error.message,
//         details: error.response?.data
//       };
//     }
//   }

//   /**
//    * Send a template message
//    */
//   @Post('send-template')
//   async sendTemplateMessage(
//     @Body() body: { phone: string; template?: string; language?: string }
//   ) {
//     const { phone, template = 'hello_world', language = 'en_US' } = body;

//     if (!phone) {
//       return {
//         success: false,
//         error: 'Phone number is required'
//       };
//     }

//     this.logger.log(`📤 Sending template message to: ${phone}`);

//     try {
//       const result = await this.whatsappService.sendTemplateMessage(phone, template, language);
//       return {
//         success: true,
//         message: 'Template message sent successfully!',
//         data: result
//       };
//     } catch (error: any) {
//       return {
//         success: false,
//         error: error.response?.data?.error?.message || error.message,
//         details: error.response?.data
//       };
//     }
//   }
// }

import {
  Controller,
  Post,
  Body,
  Get,
  BadRequestException,
  Logger,
  Param,
  InternalServerErrorException,
} from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';

@Controller('queue')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private readonly queueService: WhatsAppService) {}

  @Post('join')
async joinQueue(@Body() body: { phone?: string; name?: string; serviceType?: string }) {
  const { phone, name, serviceType } = body;

  if (!phone || !name) {
    throw new BadRequestException('Phone and Name are required');
  }

  // Normalize phone for Twilio (+2347xxxxxxx format)
  let normalizedPhone = phone.trim();
  if (!normalizedPhone.startsWith('+')) {
    normalizedPhone = `+${normalizedPhone}`;
  }

  this.logger.debug(
    `➡️ joinQueue request: phone=${normalizedPhone}, name=${name}, serviceType=${serviceType}`,
  );

  try {
    const response = await this.queueService.joinQueue(normalizedPhone, name, serviceType);
    this.logger.debug(`✅ Queue joined: ${JSON.stringify(response)}`);
    return response;
  } catch (err) {
    this.logger.error(`❌ joinQueue failed: ${err.message}`, err.stack);
    throw err;
  }
}

  //@Get()
  //async getQueue() {
  //this.logger.debug(`➡️ Fetching current queue`);
  //const result = await this.queueService.getQueue();
  //this.logger.debug(`✅ Queue fetched: ${result.length} people in queue`);
  //return result;
  //}

  @Get()
  async getQueue() {
    this.logger.debug('➡️ Fetching current queue');

    try {
      const tickets = await this.queueService.getQueue();
      this.logger.debug(`✅ Queue fetched: ${tickets.length} tickets`);
      return tickets;
    } catch (error) {
      this.logger.error(
        `❌ Failed to fetch queue: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch queue data');
    }
  }

  @Get('position/:phone')
  async getPosition(@Param('phone') phone: string) {
    let normalizedPhone = phone.trim();
    if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = `+${normalizedPhone}`;
    }

    this.logger.debug(`➡️ Getting position for: ${normalizedPhone}`);

    const position = await this.queueService.getQueuePosition(normalizedPhone);

    if (position === null) {
      throw new BadRequestException('Phone number not found in queue');
    }

    return { phone: normalizedPhone, position };
  }

  @Post('complete/:phone')
  async completeService(@Param('phone') phone: string) {
    let normalizedPhone = phone.trim();
    if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = `+${normalizedPhone}`;
    }

    this.logger.debug(`➡️ Completing service for: ${normalizedPhone}`);

    await this.queueService.completeService(normalizedPhone);

    return {
      message: 'Service completed successfully',
      phone: normalizedPhone,
    };
  }
}
