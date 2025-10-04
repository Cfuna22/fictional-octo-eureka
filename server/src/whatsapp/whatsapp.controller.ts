import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query,
  Logger 
} from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(private readonly whatsappService: WhatsAppService) {}

  /**
   * Test WhatsApp connection with a specific phone number
   */
  @Get('test')
  async testConnection(@Query('phone') phone: string) {
    this.logger.log(`🧪 Testing WhatsApp connection to: ${phone}`);
    
    if (!phone) {
      return {
        success: false,
        error: 'Phone number is required. Use ?phone=+254712345678'
      };
    }

    try {
      const result = await this.whatsappService.testConnection(phone);
      return {
        success: true,
        message: 'WhatsApp test message sent successfully!',
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        details: error.response?.data
      };
    }
  }

  /**
   * Verify WhatsApp credentials and account status
   */
  @Get('verify')
  async verifyCredentials() {
    this.logger.log('🔐 Verifying WhatsApp credentials...');
    
    try {
      const result = await this.whatsappService.verifyCredentials();
      return {
        success: true,
        message: 'WhatsApp credentials are valid!',
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        details: error.response?.data
      };
    }
  }

  /**
   * Send a custom text message
   */
  @Post('send-text')
  async sendTextMessage(
    @Body() body: { phone: string; message: string }
  ) {
    const { phone, message } = body;
    
    if (!phone || !message) {
      return {
        success: false,
        error: 'Phone and message are required'
      };
    }

    this.logger.log(`📤 Sending text message to: ${phone}`);
    
    try {
      const result = await this.whatsappService.sendTextMessage(phone, message);
      return {
        success: true,
        message: 'Text message sent successfully!',
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        details: error.response?.data
      };
    }
  }

  /**
   * Send a template message
   */
  @Post('send-template')
  async sendTemplateMessage(
    @Body() body: { phone: string; template?: string; language?: string }
  ) {
    const { phone, template = 'hello_world', language = 'en_US' } = body;
    
    if (!phone) {
      return {
        success: false,
        error: 'Phone number is required'
      };
    }

    this.logger.log(`📤 Sending template message to: ${phone}`);
    
    try {
      const result = await this.whatsappService.sendTemplateMessage(phone, template, language);
      return {
        success: true,
        message: 'Template message sent successfully!',
        data: result
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        details: error.response?.data
      };
    }
  }
}
