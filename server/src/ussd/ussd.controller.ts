import { Controller, Post, Body, Logger } from '@nestjs/common';
import { UssdService } from './ussd.service';

@Controller('ussd')
export class UssdController {
  private readonly logger = new Logger(UssdController.name);

  constructor(private readonly ussdService: UssdService) {}

  @Post('callback')
async handleUssdCallback(@Body() body: any) {
  // Log the raw incoming request with timestamp
  const timestamp = new Date().toISOString();
  console.log(`\n📞 [${timestamp}] USSD REQUEST RECEIVED:`);
  console.log('📍 Headers:', JSON.stringify(this.getHeaders(), null, 2));
  console.log('📦 Raw Body:', JSON.stringify(body, null, 2));
  
  const { phoneNumber, text, sessionId, serviceCode, networkCode } = body;

  // Enhanced logging with all possible USSD parameters
  this.logger.debug(`📱 USSD Incoming - Phone: ${phoneNumber}, Session: ${sessionId}, Text: "${text}"`);
  this.logger.debug(`🔧 Additional params - ServiceCode: ${serviceCode}, NetworkCode: ${networkCode}`);

  // Validate required parameters
  if (!phoneNumber) {
    this.logger.error('❌ Missing phoneNumber in USSD request');
    console.log('❌ VALIDATION FAILED: phoneNumber is required');
    return 'END Invalid request: phone number missing';
  }

  if (!sessionId) {
    this.logger.warn('⚠️ Missing sessionId in USSD request');
  }

  try {
    console.log(`🔄 Processing USSD session for ${phoneNumber}, input: "${text}", step: ${text ? text.split('*').length : 0}`);
    
    const response = await this.ussdService.handleUssdSession(
      phoneNumber,
      text,
      sessionId,
    );

    // Log the response that will be sent back to Africa's Talking
    console.log(`📤 USSD RESPONSE SENT:`);
    console.log('💬 Response:', response);
    console.log('📊 Response Type:', this.getResponseType(response));
    console.log('⏱️ Session Duration: ${Date.now() - new Date(timestamp).getTime()}ms');
    
    this.logger.debug(`✅ USSD Response - Type: ${this.getResponseType(response)}, Length: ${response.length} chars`);
    
    return response;
  } catch (error) {
    // Enhanced error logging
    console.error(`💥 USSD PROCESSING ERROR:`);
    console.error('❌ Error Name:', error.name);
    console.error('❌ Error Message:', error.message);
    console.error('❌ Error Stack:', error.stack);
    console.error('❌ Failed Request Body:', JSON.stringify(body, null, 2));
    
    this.logger.error(`💥 USSD Error - ${error.name}: ${error.message}`);
    this.logger.error(`🔍 Error Stack: ${error.stack}`);
    
    // Return user-friendly error message
    return 'END Service temporarily unavailable. Please try again later.';
  }
}

/**
 * Helper method to get request headers (for debugging)
 */
private getHeaders(): any {
  // If you have access to request object, you can log headers
  // For NestJS, you might need to inject @Req() in the method parameters
  return {
    'user-agent': 'whatever',
    // Add other headers you want to log
  };
}

/**
 * Determine response type for logging
 */
private getResponseType(response: string): string {
  if (!response) return 'EMPTY';
  if (response.startsWith('CON ')) return 'CONTINUE';
  if (response.startsWith('END ')) return 'END';
  return 'UNKNOWN';
}
}
