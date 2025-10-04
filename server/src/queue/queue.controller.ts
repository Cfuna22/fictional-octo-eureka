import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  BadRequestException,
  Logger,
  Query,
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Controller('queue')
export class QueueController {
  private readonly logger = new Logger(QueueController.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  @Post('join')
  async joinQueue(
    @Body() body: { phone?: string; name?: string }
  ) {
    const { phone, name } = body;

    if (!phone || !name) {
      throw new BadRequestException('Phone and Name are required');
    }

    // Normalize phone for Twilio & AT (+2547xxxxxxx format)
    let normalizedPhone = phone.trim();
    if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = `+${normalizedPhone}`;
    }

    this.logger.debug(`➡️ joinQueue request: phone=${normalizedPhone}, name=${name}`);

    try {
      const response = await this.queueService.joinQueue(normalizedPhone, name);
      this.logger.debug(`✅ Queue joined: ${JSON.stringify(response)}`);
      return response;
    } catch (err) {
      this.logger.error(`❌ joinQueue failed: ${err.message}`, err.stack);
      throw err;
    }
  }

  @Get()
  async getQueue() {
    this.logger.debug(`➡️ Fetching current queue`);
    const result = await this.queueService.getQueue();
    this.logger.debug(`✅ Queue fetched: ${JSON.stringify(result)}`);
    return result;
  }
  
  @Post('ussd')
  async ussdCallback(@Body() body: any) {
    const { sessionId, serviceCode, phoneNumber, text } = body;
    this.logger.debug(`➡️ USSD Callback: ${JSON.stringify(body)}`);

    if (!text || text === '') {
      return 'CON Welcome to Queue Service \n1. Join Queue \n2. Check Position';
    } else if (text === '1') {
      // Auto-join the queue
      try {
        const name = `User_${phoneNumber.slice(-4)}`; // fallback dummy name
        await this.queueService.joinQueue(phoneNumber, name);
        return 'END You have joined the queue successfully!';
      } catch (err) {
        this.logger.error(`❌ USSD join failed: ${err.message}`);
        return 'END Failed to join queue. Try again later.';
      }
    } else if (text === '2') {
      // Just a placeholder — ideally fetch position and SMS it back
      return 'END Your position will be sent via SMS';
    } else {
      return 'END Invalid option';
    }
  }
  
  //@Get('whatsapp-test')
  //async testWhatsApp() {
    //this.logger.debug('➡️ Testing WhatsApp connection with test number');
    //try {
      //const result = await this.whatsappService.testNetworkConnectivity();
      // this.logger.debug('✅ WhatsApp test successful');
      //return { 
        //success: result, 
        //message: result ? 'Network connectivity OK!' : 'Network connectivity failed',
      //};
    //} catch (err: any) {
      //this.logger.error(`❌ WhatsApp test failed: ${err.message}`);
      //return { 
        //success: false, 
        //error: err.response?.data || err.message 
      //};
    //}
  //}

  // Add this new endpoint for API connection testing
  //@Get('whatsapp-api-test')
  //async testWhatsAppAPI() {
    //this.logger.debug('➡️ Testing WhatsApp API connection');
    //try {
      //const result = await this.whatsappService.testAPIConnection();
      //return { 
        //success: true, 
        //message: 'WhatsApp API connection successful!',
        //data: result 
      //};
    //} catch (err: any) {
      //this.logger.error(`❌ WhatsApp API test failed: ${err.message}`);
      //return { 
        //success: false, 
        //error: err.response?.data || err.message 
      //};
    //}
  //}
}
