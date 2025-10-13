import { Injectable, Logger, HttpStatus, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import AT from 'africastalking';
import { CallNextTicketResponseDto } from './dto/call-next-response.dto';
import { ServiceAgent } from './dto/queue-ticket.dto';

@Injectable()
export class UssdService {
  private pool: Pool;
  private africasTalking: any;
  private sms: any;
  private airtime: any;
  private readonly logger = new Logger(UssdService.name);

  // Rate limiting store - in production, use Redis instead
  private readonly rateLimitMap = new Map<string, number>();
  private readonly RATE_LIMIT_WINDOW = 5000; // 5 seconds
  private readonly MAX_REQUESTS_PER_WINDOW = 10;

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
   * Main USSD handler with security enhancements
   */
  async handleUssdSession(
    phoneNumber: string,
    text: string,
    sessionId: string,
  ): Promise<string> {
    // Validate phone number format
    if (!this.isValidPhoneNumber(phoneNumber)) {
      this.logSecurityEvent('INVALID_PHONE', { phoneNumber });
      return 'END Invalid phone number.';
    }

    // Rate limiting check
    if (this.isRateLimited(phoneNumber)) {
      this.logSecurityEvent('RATE_LIMITED', { phoneNumber });
      return 'END Too many requests. Please wait a few seconds.';
    }

    const input = text ? text.split('*') : [];
    const step = input.length;
    const firstInput = input[0];

    // Log security event for monitoring
    this.logSecurityEvent('USSD_SESSION', {
      phoneNumber: this.maskPhoneNumber(phoneNumber),
      step,
      inputLength: input.length,
      sessionId,
    });

    try {
      // Step 0: show main menu
      if (step === 0 || text === '') {
        return this.showMainMenu();
      }

      // Validate first input
      if (!this.isValidMenuOption(firstInput)) {
        this.logSecurityEvent('INVALID_MENU_OPTION', {
          phoneNumber,
          firstInput,
        });
        return this.showInvalidOption();
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
      this.logSecurityEvent('USSD_ERROR', {
        phoneNumber: this.maskPhoneNumber(phoneNumber),
        error: error.message,
      });
      return this.showErrorMessage();
    }
  }

  // ---------------------------------------------------------
  // SECURITY ENHANCEMENTS
  // ---------------------------------------------------------

  /**
   * Rate limiting to prevent brute force attacks
   */
  private isRateLimited(phoneNumber: string): boolean {
    const now = Date.now();
    const requestHistory = this.rateLimitMap.get(phoneNumber) || 0;

    if (now - requestHistory < this.RATE_LIMIT_WINDOW) {
      return true;
    }

    this.rateLimitMap.set(phoneNumber, now);

    // Cleanup old entries (in production, use Redis with TTL)
    setTimeout(() => {
      this.rateLimitMap.delete(phoneNumber);
    }, this.RATE_LIMIT_WINDOW * 2);

    return false;
  }

  /**
   * Enhanced phone number validation
   */
  private isValidPhoneNumber(phone: string): boolean {
    if (!phone || typeof phone !== 'string') return false;

    const clean = phone.replace(/\s+/g, '');

    // Basic format validation
    if (!clean.startsWith('+') || clean.length < 10 || clean.length > 16) {
      return false;
    }

    // number format validation
    if (clean.startsWith('+234')) {
      const digits = clean.substring(4);
      return /^[789][01]\d{8}$/.test(digits);
    }

    // International format validation
    return /^\+[1-9]\d{1,14}$/.test(clean);
  }

  /**
   * Strict ticket number validation
   */
  private isValidTicketNumber(ticketNumber: string): boolean {
    if (!ticketNumber || typeof ticketNumber !== 'string') return false;

    // Must be exactly 7 characters: T + 6 digits
    if (ticketNumber.length !== 7) return false;

    // Must start with T and be followed by 6 digits
    return /^T\d{6}$/.test(ticketNumber);
  }

  /**
   * Menu option validation
   */
  private isValidMenuOption(option: string): boolean {
    return ['1', '2', '3', '4'].includes(option);
  }

  /**
   * Service type validation - UPDATED for both USSD and WhatsApp services
   */
  private isValidServiceType(serviceType: string): boolean {
    const validServices = [
      'Bank Teller',
      'Doctor',
      'Government Service',
      'Utility Payment',
      'Account Opening',
      'Loan Application',
      'General Inquiry',
      'Business Services',
      'Investment Consultation',
    ];
    return validServices.includes(serviceType);
  }

  /**
   * Enhanced amount validation
   */
  private isValidAmount(amount: string): boolean {
    if (!amount || typeof amount !== 'string') return false;

    const num = parseInt(amount, 10);
    return !isNaN(num) && num > 0 && num <= 10000;
  }

  /**
   * Security event logging
   */
  private logSecurityEvent(event: string, details: any): void {
    this.logger.warn(`SECURITY: ${event} - ${JSON.stringify(details)}`);
  }

  /**
   * Mask phone number for logging
   */
  private maskPhoneNumber(phone: string): string {
    if (!phone || phone.length < 4) return '***';
    return `${phone.substring(0, 4)}***${phone.substring(phone.length - 2)}`;
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
  private async handleJoinQueue(
    phoneNumber: string,
    input: string[],
  ): Promise<string> {
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
      if (!serviceType) {
        this.logSecurityEvent('INVALID_SERVICE_TYPE', {
          phoneNumber,
          input: input[1],
        });
        return this.showInvalidOption();
      }

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

      this.logSecurityEvent('INVALID_CONFIRMATION', {
        phoneNumber,
        confirmation,
      });
      return this.showInvalidOption();
    }

    return this.showInvalidOption();
  }

  // ---------------------------------------------------------
  // CHECK STATUS FLOW (SECURITY ENHANCED)
  // ---------------------------------------------------------
  private async handleCheckStatus(
    phoneNumber: string,
    input: string[],
  ): Promise<string> {
    const step = input.length;

    if (step === 1) {
      return 'CON Enter your Ticket Number:';
    }

    if (step === 2) {
      const ticketNumber = input[1].toUpperCase().trim();

      // Validate ticket number format before database query
      if (!this.isValidTicketNumber(ticketNumber)) {
        this.logSecurityEvent('INVALID_TICKET_FORMAT', {
          phoneNumber,
          ticketNumber,
        });
        return 'END ❌ Invalid ticket number format. Must be T followed by 6 digits (e.g., T000001).';
      }

      const status = await this.getQueueStatus(ticketNumber);

      if (!status) {
        this.logSecurityEvent('TICKET_NOT_FOUND', {
          phoneNumber,
          ticketNumber,
        });
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
  private async handleBuyAirtime(
    phoneNumber: string,
    input: string[],
  ): Promise<string> {
    const step = input.length;

    if (step === 1) {
      return 'CON Enter amount to buy:';
    }

    if (step === 2) {
      const amount = input[1];
      if (!this.isValidAmount(amount)) {
        return 'CON Invalid amount. Please enter a valid amount (1-10000 NGN):';
      }

      return 'CON Enter recipient number (e.g. +2347...):';
    }

    if (step === 3) {
      const amount = input[1];
      const recipient = input[2];

      this.logger.debug(
        `🔄 Processing airtime purchase - Amount: ${amount}, Recipient: ${recipient}`,
      );

      if (!this.isValidPhoneNumber(recipient)) {
        return 'CON Invalid phone number. Please re-enter:';
      }

      const result = await this.processAirtimePurchase(
        phoneNumber,
        amount,
        recipient,
      );

      this.logger.debug(
        `📊 Airtime purchase result: ${JSON.stringify(result)}`,
      );

      if (result.success) {
        return `END 💳 Airtime Purchase Successful!
Amount: ${amount} NGN
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
  private async handleBuyData(
    phoneNumber: string,
    input: string[],
  ): Promise<string> {
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
      if (!bundle) {
        this.logSecurityEvent('INVALID_BUNDLE', {
          phoneNumber,
          bundleSelection,
        });
        return this.showInvalidOption();
      }

      return `CON Confirm purchase of ${bundle.size} for ₦${bundle.amount}?
1. Yes
2. No`;
    }

    if (step === 3) {
      const bundleSelection = input[1];
      const confirmation = input[2];

      if (confirmation === '2') return 'END Transaction cancelled.';

      if (confirmation === '1') {
        const result = await this.processDataPurchase(
          phoneNumber,
          bundleSelection,
        );

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
  private showInvalidOption(): string {
    return 'END Invalid option. Please dial again to restart.';
  }

  private showErrorMessage(): string {
    return 'END Service temporarily unavailable. Please try again later.';
  }

  // ---------------------------------------------------------
  // Database + AT API methods (SECURITY ENHANCED)
  // ---------------------------------------------------------
  async joinQueue(phoneNumber: string, serviceType: string): Promise<any> {
    // Validate service type before database operation
    if (!this.isValidServiceType(serviceType)) {
      throw new Error('Invalid service type');
    }

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Check if user already exists in the SAME SERVICE queue with waiting status
      const existingUser = await client.query(
        `SELECT id, created_at FROM queue WHERE phone = $1 AND service_type = $2 AND status = 'waiting' LIMIT 1`,
        [phoneNumber, serviceType],
      );

      // If user already in queue for this service, return their current position
      if (existingUser.rows.length > 0) {
        const existingId = existingUser.rows[0].id;
        const existingCreatedAt = existingUser.rows[0].created_at;

        // Calculate current position in this specific service queue
        const posResult = await client.query(
          `SELECT COUNT(*) FROM queue WHERE status='waiting' AND created_at <= $1 AND service_type = $2`,
          [existingCreatedAt, serviceType],
        );

        const position = parseInt(posResult.rows[0].count, 10);
        const waitTime = position * 2;
        const peopleAhead = position - 1;

        // Get existing ticket number
        const ticketResult = await client.query(
          `SELECT ticket_number FROM queue WHERE id = $1`,
          [existingId],
        );

        const ticketNumber =
          ticketResult.rows[0]?.ticket_number ||
          `T${existingId.toString().padStart(6, '0')}`;

        await client.query('COMMIT');

        this.logger.debug(
          `User already in queue - Ticket: ${ticketNumber}, Position: ${position}, Service: ${serviceType}`,
        );

        // Log security event for duplicate queue attempt
        this.logSecurityEvent('QUEUE_DUPLICATE_ATTEMPT', {
          phoneNumber: this.maskPhoneNumber(phoneNumber),
          ticketNumber,
          serviceType,
          position,
        });

        return {
          ticketNumber,
          position,
          waitTime,
          peopleAhead,
          alreadyInQueue: true,
          message: `You are already in the ${serviceType} queue at position ${position}`,
        };
      }

      // Insert new queue entry
      const result = await client.query(
        `INSERT INTO queue (phone, service_type, status) VALUES ($1, $2, 'waiting') RETURNING id, created_at`,
        [phoneNumber, serviceType],
      );

      const { id, created_at } = result.rows[0];

      // Calculate position in SPECIFIC SERVICE queue
      const posResult = await client.query(
        `SELECT COUNT(*) FROM queue WHERE status='waiting' AND created_at <= $1 AND service_type = $2`,
        [created_at, serviceType],
      );

      const position = parseInt(posResult.rows[0].count, 10);

      // Generate shorter ticket number to avoid VARCHAR(20) limit
      const ticketNumber = `T${id.toString().padStart(6, '0')}`; // Format: T000001, T000002, etc.
      const waitTime = position * 2;
      const peopleAhead = position - 1;

      await client.query(`UPDATE queue SET ticket_number = $1 WHERE id = $2`, [
        ticketNumber,
        id,
      ]);

      await client.query('COMMIT');

      this.logger.debug(
        `Queue joined - Ticket: ${ticketNumber}, Position: ${position}, Service: ${serviceType}`,
      );

      // Log security event for successful queue join
      this.logSecurityEvent('QUEUE_JOINED', {
        phoneNumber: this.maskPhoneNumber(phoneNumber),
        ticketNumber,
        serviceType,
        position,
      });

      try {
        await this.sendSMSConfirmation(
          phoneNumber,
          ticketNumber,
          serviceType,
          position,
          waitTime,
        );
      } catch (smsError) {
        this.logger.error(
          `SMS sending failed but queue joined: ${smsError.message}`,
        );
      }

      return {
        ticketNumber,
        position,
        waitTime,
        peopleAhead,
        alreadyInQueue: false,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(`joinQueue Error: ${error.message}`);
      this.logSecurityEvent('QUEUE_JOIN_ERROR', {
        phoneNumber: this.maskPhoneNumber(phoneNumber),
        serviceType,
        error: error.message,
      });
      throw new Error(`Failed to join ${serviceType} queue: ${error.message}`);
    } finally {
      client.release();
    }
  }

  private async getQueueStatus(ticketNumber: string): Promise<any> {
    // Additional validation before database query
    if (!this.isValidTicketNumber(ticketNumber)) {
      this.logger.warn(
        `Invalid ticket number format attempted: ${ticketNumber}`,
      );
      return null;
    }

    try {
      this.logger.debug(`🔍 Searching for ticket: ${ticketNumber}`);

      const cleanTicket = ticketNumber.trim();

      // Use exact match instead of case-insensitive for better security
      const result = await this.pool.query(
        `SELECT id, ticket_number, service_type, created_at, status 
         FROM queue 
         WHERE ticket_number = $1`,
        [cleanTicket],
      );

      this.logger.debug(
        `📊 Ticket search results: ${result.rows.length} found`,
      );

      if (result.rows.length === 0) {
        this.logger.warn(`❌ Ticket not found: ${cleanTicket}`);
        return null;
      }

      const ticket = result.rows[0];
      this.logger.debug(
        `✅ Found ticket: ${ticket.ticket_number} for service: ${ticket.service_type}`,
      );

      if (!ticket.service_type) {
        this.logger.error(
          `❌ Ticket missing service_type: ${ticket.ticket_number}`,
        );
        return null;
      }

      const posResult = await this.pool.query(
        `SELECT COUNT(*) FROM queue 
         WHERE status = 'waiting' 
         AND created_at <= $1 
         AND service_type = $2`,
        [ticket.created_at, ticket.service_type],
      );

      const position = parseInt(posResult.rows[0].count, 10);
      const waitTime = Math.max((position - 1) * 2, 0);

      const servingResult = await this.pool.query(
        `SELECT ticket_number FROM queue 
         WHERE status = 'waiting' 
         AND service_type = $1 
         ORDER BY created_at ASC LIMIT 1`,
        [ticket.service_type],
      );

      const nowServing = servingResult.rows[0]?.ticket_number || 'None';

      this.logger.debug(
        `📊 Queue status - Position: ${position}, Now Serving: ${nowServing}, Wait: ${waitTime}min`,
      );

      return {
        ticketNumber: ticket.ticket_number,
        position,
        nowServing,
        waitTime,
      };
    } catch (error) {
      this.logger.error(`getQueueStatus error: ${error.message}`);
      this.logSecurityEvent('QUEUE_STATUS_ERROR', {
        ticketNumber,
        error: error.message,
      });
      return null;
    }
  }

  private async processAirtimePurchase(
    phoneNumber: string,
    amount: string,
    recipient: string,
  ): Promise<any> {
    try {
      this.logger.debug(
        `💳 Starting airtime purchase - Amount: ${amount}, Recipient: ${recipient}`,
      );

      const formattedRecipient = this.formatPhoneNumber(recipient);
      this.logger.debug(`📞 Formatted recipient: ${formattedRecipient}`);

      // Check if Africa's Talking is properly initialized
      if (!this.airtime) {
        this.logger.error(
          "❌ Africa's Talking AIRTIME service not initialized",
        );
        return { success: false, reason: 'Service configuration error' };
      }

      this.logger.debug(`🔄 Sending airtime request to AT...`);

      const response = await this.airtime.send({
        recipients: [
          {
            phoneNumber: formattedRecipient,
            amount: `${amount}`,
            currencyCode: 'NGN',
          },
        ],
      });

      this.logger.debug(
        `📡 AT Airtime Response: ${JSON.stringify(response, null, 2)}`,
      );

      // FIXED: Handle AT response format correctly
      // In AT API, "errorMessage": "None" actually means NO error
      const isSuccess =
        response.status === 'Success' ||
        response.status === 'Sent' ||
        response.status === 'Submitted' ||
        (response.responses && response.responses[0]?.status === 'Sent');

      if (isSuccess) {
        const transactionId =
          response.responses?.[0]?.requestId ||
          response.entries?.[0]?.requestId ||
          `TXN-${Date.now()}`;

        this.logger.debug(
          `✅ Airtime purchase successful, sending SMS confirmation...`,
        );

        // Send SMS confirmation
        try {
          await this.sms.send({
            to: [phoneNumber],
            message: `✅ Airtime Purchase Successful\nAmount: ${amount} NGN\nRecipient: ${recipient}\nTransaction ID: ${transactionId}`,
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
          response.errorMessage && response.errorMessage !== 'None'
            ? response.errorMessage
            : response.responses?.[0]?.errorMessage &&
                response.responses[0].errorMessage !== 'None'
              ? response.responses[0].errorMessage
              : response.message || 'Transaction failed';

        this.logger.error(`❌ Airtime purchase failed: ${errorMsg}`);
        return { success: false, reason: errorMsg };
      }
    } catch (error) {
      this.logger.error(`💥 Airtime purchase error: ${error.message}`);
      this.logger.error(`🔍 Error stack: ${error.stack}`);

      return {
        success: false,
        reason: error.message || 'Service temporarily unavailable',
      };
    }
  }

  private async processDataPurchase(
    phoneNumber: string,
    bundleSelection: string,
  ): Promise<any> {
    try {
      this.logger.debug(
        `📱 Starting data purchase - Bundle: ${bundleSelection}, Phone: ${phoneNumber}`,
      );

      const bundleMap = {
        '1': {
          size: '100MB',
          amount: '100',
          productName: 'data',
          provider: 'MTN',
        },
        '2': {
          size: '500MB',
          amount: '300',
          productName: 'data',
          provider: 'MTN',
        },
        '3': {
          size: '1GB',
          amount: '500',
          productName: 'data',
          provider: 'MTN',
        },
        '4': {
          size: '2GB',
          amount: '800',
          productName: 'data',
          provider: 'MTN',
        },
      };

      const bundle = bundleMap[bundleSelection];
      if (!bundle) {
        this.logger.error(`❌ Invalid bundle selection: ${bundleSelection}`);
        return { success: false, reason: 'Invalid bundle selection' };
      }

      // Check if payments service is available
      if (!this.africasTalking.PAYMENTS) {
        this.logger.error(
          "❌ Africa's Talking PAYMENTS service not initialized",
        );
        return {
          success: false,
          reason: 'Data service temporarily unavailable',
        };
      }

      this.logger.debug(
        `🔄 Processing  data bundle: ${bundle.size} for ${bundle.provider}`,
      );

      // For , use mobile data bundle API
      const response = await this.africasTalking.PAYMENTS.mobileData({
        productName: bundle.productName,
        recipients: [
          {
            phoneNumber: phoneNumber,
            currencyCode: 'NGN',
            amount: bundle.amount,
            metadata: {
              provider: bundle.provider,
              bundleSize: bundle.size,
              purpose: 'USSD Data Purchase',
            },
          },
        ],
      });

      this.logger.debug(
        `📡 AT Data Response: ${JSON.stringify(response, null, 2)}`,
      );

      // Handle -specific response format
      const isSuccess =
        response.status === 'Success' ||
        response.status === 'Sent' ||
        (response.data && response.data.status === 'Success') ||
        (response.entries && response.entries[0]?.status === 'Success');

      if (isSuccess) {
        const transactionId =
          response.entries?.[0]?.transactionId ||
          response.data?.transactionId ||
          response.transactionId ||
          `NGDATATXN-${Date.now()}`;

        this.logger.debug(
          `✅  data purchase successful, sending SMS confirmation...`,
        );

        // Send SMS confirmation
        try {
          await this.sms.send({
            to: [phoneNumber],
            message: `📶 Data Purchase Successful!\nBundle: ${bundle.size}\nAmount: ₦${bundle.amount}\nPhone: ${phoneNumber}\nTransaction ID: ${transactionId}`,
            from: this.config.get('AT_SHORTCODE'),
          });
          this.logger.debug(`📱  data purchase SMS confirmation sent`);
        } catch (smsError) {
          this.logger.error(
            `❌  data purchase SMS failed: ${smsError.message}`,
          );
          // Don't fail the transaction if SMS fails
        }

        return {
          success: true,
          bundleSize: bundle.size,
          transactionId,
          amount: bundle.amount,
        };
      } else {
        const errorMsg =
          response.errorMessage ||
          response.data?.errorMessage ||
          response.entries?.[0]?.errorMessage ||
          'Data purchase failed';

        this.logger.error(`❌  data purchase failed: ${errorMsg}`);
        return { success: false, reason: errorMsg };
      }
    } catch (error) {
      this.logger.error(`💥  data purchase error: ${error.message}`);
      this.logger.error(`🔍 Error stack: ${error.stack}`);

      return {
        success: false,
        reason: error.message || 'Data service temporarily unavailable',
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

  async getQueue(): Promise<any[]> {
    const client = await this.pool.connect();

    try {
      this.logger.debug('🔍 Fetching queue tickets from database');

      const result = await client.query(`
        SELECT 
          id,
          phone,
          name as customer_name,  -- Make sure this matches your database column
          service_type,
          ticket_number,
          status,
          created_at,
          ROW_NUMBER() OVER (PARTITION BY service_type ORDER BY created_at) as position,
          (ROW_NUMBER() OVER (PARTITION BY service_type ORDER BY created_at) - 1) * 2 as estimated_wait_time,
          'normal' as priority
        FROM queue 
        WHERE status = 'waiting'
        ORDER BY service_type, created_at
      `);

      this.logger.debug(`📊 Found ${result.rows.length} waiting tickets`);

      return result.rows.map((ticket) => ({
        ...ticket,
        customer_name: ticket.customer_name || 'Guest Customer',
        service_type: ticket.service_type || 'General Service',
        ticket_number: ticket.ticket_number || `T${ticket.id.slice(-6)}`,
      }));
    } catch (error) {
      this.logger.error(
        `❌ Database error in getQueueTickets: ${error.message}`,
      );
      throw error;
    } finally {
      client.release();
    }
  }

  async callNextTicket(
  agentId: string,
  serviceType?: string,
): Promise<CallNextTicketResponseDto> {
  const client = await this.pool.connect();

  try {
    this.logger.debug(
      `🔔 Calling next ticket for agent: ${agentId}, service: ${serviceType}`,
    );

    // Start transaction
    await client.query('BEGIN');

    // 1. Find the agent
    const agentResult = await client.query(
      'SELECT * FROM service_agents WHERE id = $1',
      [agentId],
    );

    if (agentResult.rows.length === 0) {
      throw new HttpException('Agent not found', HttpStatus.NOT_FOUND);
    }

    const agent = agentResult.rows[0];

    // 2. Build query for next ticket - handle NULL service_type for "General Service"
    let nextTicketQuery = `
      SELECT 
        id,
        phone,
        name as customer_name,
        service_type,
        ticket_number,
        status,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY service_type ORDER BY created_at) as position,
        (ROW_NUMBER() OVER (PARTITION BY service_type ORDER BY created_at) - 1) * 2 as estimated_wait_time,
        'normal' as priority
      FROM queue 
      WHERE status = 'waiting'
    `;

    const queryParams: any[] = [];
    
    console.log('🔍 DEBUG - Service type from frontend:', serviceType);

    if (serviceType && serviceType !== 'Unknown Service') {
      console.log('🔍 DEBUG - Filtering by service type:', serviceType);
      if (serviceType && serviceType !== 'Unknown Service') {
        console.log('🔍 DEBUG - Filtering by service type:', serviceType);
        queryParams.push(serviceType);
        nextTicketQuery += ` AND service_type = $${queryParams.length}`;
      } else {
        queryParams.push(serviceType);
        nextTicketQuery += ` AND service_type = $${queryParams.length}`;
      }
    }

    nextTicketQuery += ` ORDER BY created_at ASC LIMIT 1`;
    
    console.log('🔍 DEBUG - Final query:', nextTicketQuery);
    console.log('🔍 DEBUG - Query params:', queryParams);

    const nextTicketResult = await client.query(nextTicketQuery, queryParams);
    console.log('🔍 DEBUG - Found tickets:', nextTicketResult.rows.length);
    console.log('🔍 DEBUG - Ticket details:', nextTicketResult.rows);
    const nextTicket = nextTicketResult.rows[0];

    if (!nextTicket) {
      // No next ticket available - set agent to available and clear current ticket
      if (agent.current_ticket) {
        await client.query(
          `UPDATE service_agents 
           SET current_ticket = NULL, 
               status = 'available'
           WHERE id = $1`,
          [agentId],
        );
      }
      
      await client.query('COMMIT');
      return {
        currentTicket: null,
        nextTicket: null,
        message: `No waiting tickets${serviceType ? ` for ${serviceType}` : ''}`,
      };
    }

    // 3. Complete current ticket if agent has one (BEFORE calling next)
    let completedTicket: any = null;
    if (agent.current_ticket) {
      // Get the current ticket details before completing it
      const currentTicketResult = await client.query(
        `SELECT 
          id,
          phone,
          name as customer_name,
          service_type,
          ticket_number,
          status,
          created_at
         FROM queue 
         WHERE ticket_number = $1 AND status = 'in_progress'`,
        [agent.current_ticket],
      );
      
      completedTicket = currentTicketResult.rows[0];
      
      // Mark current ticket as completed (without completed_at column)
      await client.query(
        `UPDATE queue 
         SET status = 'completed'
         WHERE ticket_number = $1 AND status = 'in_progress'`,
        [agent.current_ticket],
      );
      
      this.logger.debug(
        `✅ Completed current ticket: ${agent.current_ticket}`,
      );
    }

    // 4. Update the next ticket to in_progress (without called_at column)
    await client.query(
      `UPDATE queue 
       SET status = 'in_progress'
       WHERE id = $1`,
      [nextTicket.id],
    );

    // 5. Get the updated ticket with recalculated position
    const updatedTicketResult = await client.query(
      `SELECT 
        id,
        phone,
        name as customer_name,
        service_type,
        ticket_number,
        status,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY service_type ORDER BY created_at) as position,
        (ROW_NUMBER() OVER (PARTITION BY service_type ORDER BY created_at) - 1) * 2 as estimated_wait_time,
        'normal' as priority
       FROM queue 
       WHERE id = $1`,
      [nextTicket.id],
    );

    const updatedTicket = updatedTicketResult.rows[0];

    // 6. Update agent's current ticket and status
    await client.query(
      `UPDATE service_agents 
       SET current_ticket = $1, 
           status = 'busy', 
           total_served = COALESCE(total_served, 0) + 1 
       WHERE id = $2`,
      [nextTicket.ticket_number, agentId],
    );

    await client.query('COMMIT');

    this.logger.debug(
      `✅ Successfully called ticket: ${updatedTicket.ticket_number} for ${updatedTicket.customer_name}`,
    );

    // Create message based on whether a ticket was completed
    let message: string;
    if (completedTicket && completedTicket.ticket_number) {
      message = `Completed ${completedTicket.ticket_number} and called ${updatedTicket.ticket_number} for ${updatedTicket.customer_name}`;
    } else {
      message = `Called ticket ${updatedTicket.ticket_number} for ${updatedTicket.customer_name}`;
    }

    return {
      currentTicket: completedTicket,
      nextTicket: updatedTicket,
      message: message,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    this.logger.error(`❌ Error calling next ticket: ${error.message}`);
    throw new HttpException(
      'Failed to call next ticket',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  } finally {
    client.release();
  }
}
  async getAgents(): Promise<ServiceAgent[]> {
  const client = await this.pool.connect();

  try {
    this.logger.debug('🔍 Fetching agents from database');

    const result = await client.query(`
      SELECT 
        id,
        name,
        status,
        COALESCE(efficiency, 0) as efficiency,
        COALESCE(total_served, 0) as "totalServed",
        COALESCE(skills, '{}') as skills,
        current_ticket as "currentTicket",
        created_at
      FROM service_agents 
      ORDER BY name
    `);

    this.logger.debug(`📊 Found ${result.rows.length} agents`);

    // Map the database rows to ServiceAgent interface
    return result.rows.map(agent => ({
      id: agent.id,
      name: agent.name,
      status: agent.status,
      efficiency: agent.efficiency,
      totalServed: agent.totalServed,
      skills: agent.skills || [],
      currentTicket: agent.currentTicket,
      created_at: agent.created_at
    }));
  } catch (error) {
    this.logger.error(`❌ Database error in getAgents: ${error.message}`);
    throw error;
  } finally {
    client.release();
  }
}
}
