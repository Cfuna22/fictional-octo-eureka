import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import AT from 'africastalking';

@Injectable()
export class UssdService {
  private pool: Pool;
  private africasTalking: any;
  private sms: any;
  private airtime: any;
  private readonly logger = new Logger(UssdService.name);

  constructor(private config: ConfigService) {
    // PostgreSQL connection
    this.pool = new Pool({ connectionString: this.config.get('DATABASE_URL') });

    // Africa's Talking setup
    this.africasTalking = AT({
      username: this.config.get('AT_USERNAME'),
      apiKey: this.config.get('AT_API_KEY'),
    });
    this.sms = this.africasTalking.SMS;
    this.airtime = this.africasTalking.AIRTIME;
  }

  /**
   * Main USSD handler
   */
  async handleUssdSession(
    phoneNumber: string,
    text: string,
    sessionId: string,
  ): Promise<string> {
    const input = text ? text.split('*') : [];
    const step = input.length;
    const firstInput = input[0];

    this.logger.debug(
      `USSD Session: phone=${phoneNumber}, step=${step}, input=${JSON.stringify(input)}`,
    );

    try {
      // Step 0: show main menu
      if (step === 0 || text === '') {
        return this.showMainMenu();
      }

      switch (firstInput) {
        case '1':
          return await this.handleJoinQueue(phoneNumber, input);
        case '2':
          return await this.handleCheckStatus(phoneNumber, input);
        case '3':
          return await this.handleBuyAirtime(phoneNumber, input);
        case '4':
          return await this.handleBuyData(phoneNumber, input);
        default:
          return this.showInvalidOption();
      }
    } catch (error) {
      this.logger.error(`USSD Error: ${error.message}`);
      return this.showErrorMessage();
    }
  }

  // ---------------------------------------------------------
  // MAIN MENU
  // ---------------------------------------------------------
  private showMainMenu(): string {
    return `CON Qatalyst Queue Service:
1. Join Queue
2. Check Status
3. Buy Airtime
4. Buy Data

Reply with 1-4`;
  }

  // ---------------------------------------------------------
  // JOIN QUEUE FLOW
  // ---------------------------------------------------------
  private async handleJoinQueue(phoneNumber: string, input: string[]): Promise<string> {
    const step = input.length;

    if (step === 1) {
      // Step 1: Ask user to select a service
      return `CON Select Service:
1. Bank Teller
2. Doctor
3. Government Service
4. Utility Payment

Reply with 1-4`;
    }

    if (step === 2) {
      // Step 2: Ask user to confirm joining
      const serviceMap = {
        '1': 'Bank Teller',
        '2': 'Doctor',
        '3': 'Government Service',
        '4': 'Utility Payment',
      };

      const serviceType = serviceMap[input[1]];
      if (!serviceType) return this.showInvalidOption();

      return `CON You selected "${serviceType}".\nDo you want to join this queue?\n1. Yes\n2. No`;
    }

    if (step === 3) {
      const serviceMap = {
        '1': 'Bank Teller',
        '2': 'Doctor',
        '3': 'Government Service',
        '4': 'Utility Payment',
      };

      const serviceType = serviceMap[input[1]];
      const confirmation = input[2];

      if (confirmation === '2') {
        return 'END Operation cancelled. Thank you.';
      }

      if (confirmation === '1') {
        const ticket = await this.joinQueue(phoneNumber, serviceType);

        return `END ✅ You joined the ${serviceType} queue!

Ticket: ${ticket.ticketNumber}
Position: ${ticket.position}
Wait Time: ~${ticket.waitTime} min
People Ahead: ${ticket.peopleAhead}

We'll notify you via SMS.`;
      }

      return this.showInvalidOption();
    }

    return this.showInvalidOption();
  }

  // ---------------------------------------------------------
  // CHECK STATUS FLOW
  // ---------------------------------------------------------
  private async handleCheckStatus(phoneNumber: string, input: string[]): Promise<string> {
    const step = input.length;

    if (step === 1) {
      return 'CON Enter your Ticket Number:';
    }

    if (step === 2) {
      const ticketNumber = input[1].toUpperCase();
      const status = await this.getQueueStatus(ticketNumber);

      if (!status) {
        return 'END ❌ Ticket not found. Please check your number.';
      }

      return `END 🎫 Ticket: ${status.ticketNumber}
Position: ${status.position}
Now Serving: ${status.nowServing}
Wait: ~${status.waitTime} min`;
    }

    return this.showInvalidOption();
  }

  // ---------------------------------------------------------
  // BUY AIRTIME FLOW
  // ---------------------------------------------------------
  private async handleBuyAirtime(phoneNumber: string, input: string[]): Promise<string> {
    const step = input.length;

    if (step === 1) {
      return 'CON Enter amount to buy:';
    }

    if (step === 2) {
      const amount = input[1];
      if (!this.isValidAmount(amount)) {
        return 'CON Invalid amount. Please enter a valid amount:';
      }

      return 'CON Enter recipient number (e.g. +2547...):';
    }

    if (step === 3) {
      const amount = input[1];
      const recipient = input[2];
      
      this.logger.debug(`🔄 Processing airtime purchase - Amount: ${amount}, Recipient: ${recipient}`);
      
      if (!this.isValidPhoneNumber(recipient)) {
        return 'CON Invalid phone number. Please re-enter:';
      }

      const result = await this.processAirtimePurchase(phoneNumber, amount, recipient);

      this.logger.debug(`📊 Airtime purchase result: ${JSON.stringify(result)}`);

      if (result.success) {
        return `END 💳 Airtime Purchase Successful!
Amount: ${amount} KES
Recipient: ${recipient}
Transaction ID: ${result.transactionId}`;
      } else {
        return `END ❌ Transaction Failed.
Reason: ${result.reason || 'Unknown error'}`;
      }
    }

    return this.showInvalidOption();
  }

  // ---------------------------------------------------------
  // BUY DATA FLOW
  // ---------------------------------------------------------
  private async handleBuyData(phoneNumber: string, input: string[]): Promise<string> {
    const step = input.length;

    if (step === 1) {
      return `CON Select Data Bundle:
1. 100MB - ₦100
2. 500MB - ₦300
3. 1GB - ₦500
4. 2GB - ₦800

Reply with 1-4`;
    }

    if (step === 2) {
      const bundleSelection = input[1];
      const bundleMap = {
        '1': { size: '100MB', amount: '100' },
        '2': { size: '500MB', amount: '300' },
        '3': { size: '1GB', amount: '500' },
        '4': { size: '2GB', amount: '800' },
      };

      const bundle = bundleMap[bundleSelection];
      if (!bundle) return this.showInvalidOption();

      return `CON Confirm purchase of ${bundle.size} for ₦${bundle.amount}?
1. Yes
2. No`;
    }

    if (step === 3) {
      const bundleSelection = input[1];
      const confirmation = input[2];

      if (confirmation === '2') return 'END Transaction cancelled.';

      if (confirmation === '1') {
        const result = await this.processDataPurchase(phoneNumber, bundleSelection);

        if (result.success) {
          return `END 📱 Data Purchase Successful!
Bundle: ${result.bundleSize}
Transaction ID: ${result.transactionId}`;
        } else {
          return `END ❌ Transaction Failed.
Reason: ${result.reason}`;
        }
      }
    }

    return this.showInvalidOption();
  }

  // ---------------------------------------------------------
  // REUSABLE HELPERS
  // ---------------------------------------------------------
  private isValidAmount(amount: string): boolean {
    const num = parseInt(amount, 10);
    return !isNaN(num) && num > 0 && num <= 10000;
  }

  private isValidPhoneNumber(phone: string): boolean {
    const clean = phone.replace(/\s+/g, '');
    return clean.startsWith('+') && clean.length >= 10;
  }

  private showInvalidOption(): string {
    return 'END Invalid option. Please dial again to restart.';
  }

  private showErrorMessage(): string {
    return 'END Service temporarily unavailable. Please try again later.';
  }

  // ---------------------------------------------------------
  // Database + AT API methods
  // ---------------------------------------------------------
  private async joinQueue(phoneNumber: string, serviceType: string): Promise<any> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO queue (phone, service_type, status) VALUES ($1, $2, 'waiting') RETURNING id, created_at`,
        [phoneNumber, serviceType],
      );

      const { id, created_at } = result.rows[0];
      
      const posResult = await client.query(
        `SELECT COUNT(*) FROM queue WHERE status='waiting' AND created_at <= $1 AND service_type = $2`,
        [created_at, serviceType],
      );

      const position = parseInt(posResult.rows[0].count, 10);
      
      // Generate shorter ticket number to avoid VARCHAR(20) limit
      const ticketNumber = `T${id.toString().padStart(6, '0')}`; // Format: T000001, T000002, etc.
      const waitTime = position * 2;
      const peopleAhead = position - 1;

      await client.query(
        `UPDATE queue SET ticket_number = $1 WHERE id = $2`,
        [ticketNumber, id]
      );

      await client.query('COMMIT');

      this.logger.debug(`Queue joined - Ticket: ${ticketNumber}, Position: ${position}, Service: ${serviceType}`);

      try {
        await this.sendSMSConfirmation(phoneNumber, ticketNumber, serviceType, position, waitTime);
      } catch (smsError) {
        this.logger.error(`SMS sending failed but queue joined: ${smsError.message}`);
      }

      return { ticketNumber, position, waitTime, peopleAhead };
      
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(`joinQueue Error: ${error.message}`);
      throw new Error(`Failed to join queue: ${error.message}`);
    } finally {
      client.release();
    }
  }

  private async getQueueStatus(ticketNumber: string): Promise<any> {
    try {
      this.logger.debug(`🔍 Searching for ticket: ${ticketNumber}`);
      
      const cleanTicket = ticketNumber.trim();
      
      const result = await this.pool.query(
        `SELECT * FROM queue WHERE LOWER(ticket_number) = LOWER($1)`, 
        [cleanTicket]
      );

      this.logger.debug(`📊 Ticket search results: ${result.rows.length} found`);
      
      if (result.rows.length === 0) {
        this.logger.warn(`❌ Ticket not found: ${cleanTicket}`);
        return null;
      }

      const ticket = result.rows[0];
      this.logger.debug(`✅ Found ticket: ${ticket.ticket_number} for service: ${ticket.service_type}`);

      if (!ticket.service_type) {
        this.logger.error(`❌ Ticket missing service_type: ${ticket.ticket_number}`);
        return null;
      }

      const posResult = await this.pool.query(
        `SELECT COUNT(*) FROM queue 
         WHERE status = 'waiting' 
         AND created_at <= $1 
         AND service_type = $2`,
        [ticket.created_at, ticket.service_type]
      );

      const position = parseInt(posResult.rows[0].count, 10);
      const waitTime = Math.max((position - 1) * 2, 0);

      const servingResult = await this.pool.query(
        `SELECT ticket_number FROM queue 
         WHERE status = 'waiting' 
         AND service_type = $1 
         ORDER BY created_at ASC LIMIT 1`,
        [ticket.service_type]
      );

      const nowServing = servingResult.rows[0]?.ticket_number || 'None';

      this.logger.debug(`📊 Queue status - Position: ${position}, Now Serving: ${nowServing}, Wait: ${waitTime}min`);

      return { 
        ticketNumber: ticket.ticket_number, 
        position, 
        nowServing, 
        waitTime 
      };
      
    } catch (error) {
      this.logger.error(`getQueueStatus error: ${error.message}`);
      return null;
    }
  }

  private async processAirtimePurchase(phoneNumber: string, amount: string, recipient: string): Promise<any> {
  try {
    this.logger.debug(`💳 Starting airtime purchase - Amount: ${amount}, Recipient: ${recipient}`);
    
    const formattedRecipient = this.formatPhoneNumber(recipient);
    this.logger.debug(`📞 Formatted recipient: ${formattedRecipient}`);

    // Check if Africa's Talking is properly initialized
    if (!this.airtime) {
      this.logger.error('❌ Africa\'s Talking AIRTIME service not initialized');
      return { success: false, reason: 'Service configuration error' };
    }

    this.logger.debug(`🔄 Sending airtime request to AT...`);
    
    const response = await this.airtime.send({
      recipients: [{
        phoneNumber: formattedRecipient, 
        amount: `${amount}`, 
        currencyCode: 'NGN'
      }]
    });

    this.logger.debug(`📡 AT Airtime Response: ${JSON.stringify(response, null, 2)}`);

    // FIXED: Handle AT response format correctly
    // In AT API, "errorMessage": "None" actually means NO error
    const isSuccess = 
      response.status === 'Success' || 
      response.status === 'Sent' || 
      response.status === 'Submitted' ||
      (response.responses && response.responses[0]?.status === 'Sent');

    if (isSuccess) {
      const transactionId = response.responses?.[0]?.requestId || 
                           response.entries?.[0]?.requestId || 
                           `TXN-${Date.now()}`;
      
      this.logger.debug(`✅ Airtime purchase successful, sending SMS confirmation...`);
      
      // Send SMS confirmation
      try {
        await this.sms.send({
          to: [phoneNumber],
          message: `✅ Airtime Purchase Successful\nAmount: ${amount} KES\nRecipient: ${recipient}\nTransaction ID: ${transactionId}`,
          from: this.config.get('AT_SHORTCODE'),
        });
        this.logger.debug(`📱 SMS confirmation sent`);
      } catch (smsError) {
        this.logger.error(`❌ SMS sending failed: ${smsError.message}`);
        // Don't fail the transaction if SMS fails
      }
      
      return { success: true, transactionId };
      
    } else {
      // FIXED: Check for actual error messages
      const errorMsg = 
        response.errorMessage && response.errorMessage !== 'None' ? response.errorMessage :
        response.responses?.[0]?.errorMessage && response.responses[0].errorMessage !== 'None' ? response.responses[0].errorMessage :
        response.message || 'Transaction failed';
      
      this.logger.error(`❌ Airtime purchase failed: ${errorMsg}`);
      return { success: false, reason: errorMsg };
    }
    
  } catch (error) {
    this.logger.error(`💥 Airtime purchase error: ${error.message}`);
    this.logger.error(`🔍 Error stack: ${error.stack}`);
    
    return { 
      success: false, 
      reason: error.message || 'Service temporarily unavailable' 
    };
  }
}
  private async processDataPurchase(phoneNumber: string, bundleSelection: string): Promise<any> {
  try {
    this.logger.debug(`📱 Starting Nigeria data purchase - Bundle: ${bundleSelection}, Phone: ${phoneNumber}`);
    
    const bundleMap = {
      '1': { 
        size: '100MB', 
        amount: '100',
        productName: 'data', // This varies by network - you'll need specific product codes
        provider: 'MTN' // or 'AIRTEL', 'GLO', '9MOBILE'
      },
      '2': { 
        size: '500MB', 
        amount: '300',
        productName: 'data',
        provider: 'MTN'
      },
      '3': { 
        size: '1GB', 
        amount: '500',
        productName: 'data', 
        provider: 'MTN'
      },
      '4': { 
        size: '2GB', 
        amount: '800',
        productName: 'data',
        provider: 'MTN'
      },
    };

    const bundle = bundleMap[bundleSelection];
    if (!bundle) {
      this.logger.error(`❌ Invalid bundle selection: ${bundleSelection}`);
      return { success: false, reason: 'Invalid bundle selection' };
    }

    // Check if payments service is available
    if (!this.africasTalking.PAYMENTS) {
      this.logger.error('❌ Africa\'s Talking PAYMENTS service not initialized');
      return { success: false, reason: 'Data service temporarily unavailable' };
    }

    this.logger.debug(`🔄 Processing Nigeria data bundle: ${bundle.size} for ${bundle.provider}`);
    
    // For Nigeria, use mobile data bundle API
    const response = await this.africasTalking.PAYMENTS.mobileData({
      productName: bundle.productName,
      recipients: [{
        phoneNumber: phoneNumber,
        currencyCode: 'NGN',
        amount: bundle.amount,
        metadata: {
          provider: bundle.provider,
          bundleSize: bundle.size,
          purpose: 'USSD Data Purchase'
        }
      }]
    });

    this.logger.debug(`📡 AT Nigeria Data Response: ${JSON.stringify(response, null, 2)}`);

    // Handle Nigeria-specific response format
    const isSuccess = 
      response.status === 'Success' || 
      response.status === 'Sent' ||
      (response.data && response.data.status === 'Success') ||
      (response.entries && response.entries[0]?.status === 'Success');

    if (isSuccess) {
      const transactionId = response.entries?.[0]?.transactionId || 
                           response.data?.transactionId ||
                           response.transactionId || 
                           `NGDATATXN-${Date.now()}`;

      this.logger.debug(`✅ Nigeria data purchase successful, sending SMS confirmation...`);
      
      // Send SMS confirmation
      try {
        await this.sms.send({
          to: [phoneNumber],
          message: `📶 Data Purchase Successful!\nBundle: ${bundle.size}\nAmount: ₦${bundle.amount}\nPhone: ${phoneNumber}\nTransaction ID: ${transactionId}`,
          from: this.config.get('AT_SHORTCODE'),
        });
        this.logger.debug(`📱 Nigeria data purchase SMS confirmation sent`);
      } catch (smsError) {
        this.logger.error(`❌ Nigeria data purchase SMS failed: ${smsError.message}`);
        // Don't fail the transaction if SMS fails
      }
      
      return { success: true, bundleSize: bundle.size, transactionId, amount: bundle.amount };
      
    } else {
      const errorMsg = response.errorMessage || 
                      response.data?.errorMessage ||
                      response.entries?.[0]?.errorMessage || 
                      'Data purchase failed';
      
      this.logger.error(`❌ Nigeria data purchase failed: ${errorMsg}`);
      return { success: false, reason: errorMsg };
    }
    
  } catch (error) {
    this.logger.error(`💥 Nigeria data purchase error: ${error.message}`);
    this.logger.error(`🔍 Error stack: ${error.stack}`);
    
    return { 
      success: false, 
      reason: error.message || 'Data service temporarily unavailable' 
    };
  }
}
  private formatPhoneNumber(phone: string): string {
    let formatted = phone.replace(/\s+/g, '');
    if (!formatted.startsWith('+')) formatted = `+${formatted}`;
    return formatted;
  }

  private async sendSMSConfirmation(
    phoneNumber: string,
    ticketNumber: string,
    serviceType: string,
    position: number,
    waitTime: number,
  ): Promise<void> {
    const message = `✅ Queue Ticket Confirmed\n\nTicket: ${ticketNumber}\nService: ${serviceType}\nPosition: ${position}\nWait Time: ~${waitTime} min`;
    try {
      await this.sms.send({
        to: [phoneNumber],
        message,
        from: this.config.get('AT_SHORTCODE'),
      });
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`);
    }
  }
}
