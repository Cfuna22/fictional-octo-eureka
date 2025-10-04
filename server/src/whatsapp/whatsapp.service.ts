import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class WhatsAppService {
  private readonly baseUrl: string;
  private readonly phoneNumberId: string;
  private readonly accessToken: string;
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    const phoneNumberId = this.configService.get<string>('META_PHONE_NUMBER_ID');
    const accessToken = this.configService.get<string>('META_ACCESS_TOKEN');
    
    if (!phoneNumberId || !accessToken) {
      throw new Error('META_PHONE_NUMBER_ID and META_ACCESS_TOKEN must be defined in environment variables');
    }
    
    this.phoneNumberId = phoneNumberId;
    this.accessToken = accessToken;
    const apiVersion = this.configService.get<string>('META_API_VERSION') || 'v22.0';
    this.baseUrl = `https://graph.facebook.com/${apiVersion}`;
    
    this.logger.log('WhatsApp Service Initialized');
    this.logger.debug(`Phone Number ID: ${this.phoneNumberId}`);
    this.logger.debug(`API Version: ${apiVersion}`);
  }

  /**
   * Send a simple text message
   */
  async sendTextMessage(phone: string, message: string): Promise<any> {
    const formattedPhone = this.formatPhoneNumber(phone);
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'text',
      text: {
        body: message
      }
    };

    this.logger.debug(`📤 Sending text message to: ${formattedPhone}`);
    this.logger.debug(`Message: ${message}`);

    try {
      const response$ = this.httpService.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const response = await lastValueFrom(response$);
      this.logger.log('✅ Text message sent successfully');
      this.logger.debug(`Message ID: ${response.data.messages[0]?.id}`);
      return response.data;
    } catch (error: any) {
      this.logger.error('❌ Failed to send text message');
      this.handleWhatsAppError(error);
      throw error;
    }
  }

  /**
   * Send a template message
   */
  async sendTemplateMessage(phone: string, templateName: string = 'hello_world', languageCode: string = 'en_US'): Promise<any> {
    const formattedPhone = this.formatPhoneNumber(phone);
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode
        }
      }
    };

    this.logger.debug(`📤 Sending template message to: ${formattedPhone}`);
    this.logger.debug(`Template: ${templateName}`);

    try {
      const response$ = this.httpService.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const response = await lastValueFrom(response$);
      this.logger.log('✅ Template message sent successfully');
      this.logger.debug(`Message ID: ${response.data.messages[0]?.id}`);
      return response.data;
    } catch (error: any) {
      this.logger.error('❌ Failed to send template message');
      this.handleWhatsAppError(error);
      throw error;
    }
  }

  /**
   * Send welcome message for queue system
   */
  async sendWelcomeMessage(phone: string, name: string, position: number): Promise<any> {
    const message = `Hi ${name}, you joined the queue! Your position is ${position}`;
    
    try {
      // First try to send as text message
      return await this.sendTextMessage(phone, message);
    } catch (error: any) {
      this.logger.warn('Text message failed, falling back to template...');
      // Fallback to template message
      return await this.sendTemplateMessage(phone);
    }
  }

  /**
   * Test the WhatsApp connection with a simple message
   */
  async testConnection(testPhone: string): Promise<any> {
    this.logger.log(`🧪 Testing WhatsApp connection to: ${testPhone}`);
    
    try {
      const result = await this.sendTemplateMessage(testPhone, 'hello_world', 'en_US');
      this.logger.log('✅ WhatsApp test successful!');
      return result;
    } catch (error: any) {
      this.logger.error('❌ WhatsApp test failed');
      throw error;
    }
  }

  /**
   * Verify WhatsApp business account credentials
   */
  async verifyCredentials(): Promise<any> {
    const url = `${this.baseUrl}/${this.phoneNumberId}`;
    
    this.logger.debug('🔐 Verifying WhatsApp credentials...');

    try {
      const response$ = this.httpService.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      const response = await lastValueFrom(response$);
      this.logger.log('✅ WhatsApp credentials verified successfully');
      return response.data;
    } catch (error: any) {
      this.logger.error('❌ WhatsApp credentials verification failed');
      this.handleWhatsAppError(error);
      throw error;
    }
  }

  /**
   * Format phone number to international format
   */
  private formatPhoneNumber(phone: string): string {
    let formatted = phone.replace(/\s+/g, '');
    
    // Ensure it starts with +
    if (!formatted.startsWith('+')) {
      formatted = `+${formatted}`;
    }
    
    // Convert local Kenyan numbers to international format
    if (formatted.startsWith('+0')) {
      formatted = formatted.replace('+0', '+254');
    } else if (formatted.startsWith('07') && formatted.length === 10) {
      formatted = `+254${formatted.slice(1)}`;
    } else if (formatted.startsWith('7') && formatted.length === 9) {
      formatted = `+254${formatted}`;
    }
    
    this.logger.debug(`Formatted phone: ${phone} -> ${formatted}`);
    return formatted;
  }

  /**
   * Handle and log WhatsApp API errors
   */
  private handleWhatsAppError(error: any): void {
    if (error.response) {
      const { status, data } = error.response;
      this.logger.error(`HTTP ${status}: ${data.error?.message || 'Unknown error'}`);
      
      if (data.error) {
        this.logger.error(`Error Type: ${data.error.type}`);
        this.logger.error(`Error Code: ${data.error.code}`);
        this.logger.error(`fbtrace_id: ${data.error.fbtrace_id}`);
        
        // Common error codes and their meanings
        const errorMessages: { [key: number]: string } = {
          100: 'Invalid parameter',
          131009: 'Message too long',
          131021: 'Template parameter mismatch',
          131026: 'Template doesn\'t exist',
          131051: 'Message expired',
          131052: 'Too many messages',
        };
        
        if (data.error.code in errorMessages) {
          this.logger.error(`Meaning: ${errorMessages[data.error.code]}`);
        }
      }
    } else if (error.request) {
      this.logger.error('No response received from WhatsApp API');
      this.logger.error('Check internet connection and API endpoint');
    } else {
      this.logger.error(`Request setup error: ${error.message}`);
    }
  }
}
