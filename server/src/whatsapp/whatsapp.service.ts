import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import twilio from 'twilio';

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private pool: Pool;
  private twilioClient: ReturnType<typeof twilio>;
  private twilioWhatsAppNumber: string;
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private config: ConfigService) {
    this.pool = new Pool({ 
      connectionString: this.config.get('DATABASE_URL') 
    });
  }

  async onModuleInit() {
    await this.initializeTwilio();
  }

  private async initializeTwilio() {
    try {
      // Validate configuration with proper type handling
      const accountSid = this.config.get<string>('TWILIO_ACCOUNT_SID');
      const authToken = this.config.get<string>('TWILIO_AUTH_TOKEN');
      const twilioNumber = this.config.get<string>('TWILIO_WHATSAPP_NUMBER');

      this.logger.debug('🔍 Twilio Configuration Check:', {
        hasSid: !!accountSid,
        hasToken: !!authToken,
        hasNumber: !!twilioNumber,
        number: twilioNumber
      });

      if (!accountSid || !authToken || !twilioNumber) {
        throw new Error(
          'Twilio configuration missing. Please check your environment variables: ' +
          `TWILIO_ACCOUNT_SID=${!!accountSid}, ` +
          `TWILIO_AUTH_TOKEN=${!!authToken}, ` +
          `TWILIO_WHATSAPP_NUMBER=${!!twilioNumber}`
        );
      }

      // Initialize Twilio client
      this.twilioClient = twilio(accountSid, authToken);
      this.twilioWhatsAppNumber = twilioNumber; // Now it's guaranteed to be a string
      
      this.logger.log('✅ Twilio client initialized successfully');
      this.logger.log(`📱 Using WhatsApp number: ${this.twilioWhatsAppNumber}`);

    } catch (error) {
      this.logger.error('❌ Failed to initialize Twilio:', error.message);
      // Don't throw here - allow the service to work without Twilio
      this.logger.warn('⚠️ Continuing without Twilio functionality');
    }
  }

  async joinQueue(phone: string, name: string, serviceType?: string) {
    this.logger.debug(`🔍 joinQueue called: ${name}, ${phone}, service: ${serviceType}`);
    
    let client;
    try {
      client = await this.pool.connect();

      // Get the kiosk for this service type
      let kioskId = null;
      if (serviceType) {
        const kioskResult = await client.query(
          `SELECT id FROM kiosks WHERE service_type = $1 LIMIT 1`,
          [serviceType]
        );
        if (kioskResult.rows.length > 0) {
          kioskId = kioskResult.rows[0].id;
          this.logger.debug(`📱 Assigned to kiosk: ${kioskId} for service: ${serviceType}`);
        } else {
          this.logger.warn(`⚠️ No kiosk found for service type: ${serviceType}`);
        }
      }

      // Check if user already exists
      const existingUser = await client.query(
        `SELECT * FROM queue WHERE phone = $1 LIMIT 1`,
        [phone],
      );

      this.logger.debug(`📊 Existing user check: ${existingUser.rowCount} records found`);

      // Insert into queue with service type and kiosk_id
      const result = await client.query(
        `INSERT INTO queue (phone, name, status, service_type, kiosk_id) VALUES ($1, $2, 'waiting', $3, $4) RETURNING id, created_at`,
        [phone, name, serviceType || null, kioskId],
      );

      const { id, created_at } = result.rows[0];
      this.logger.debug(`✅ User inserted with ID: ${id}, service: ${serviceType}, kiosk: ${kioskId}`);

      // Update kiosk active queue count if kiosk is assigned
      if (kioskId) {
        await client.query(
          `UPDATE kiosks 
           SET active_queue = active_queue + 1, 
               updated_at = NOW() 
           WHERE id = $1`,
          [kioskId],
        );
        this.logger.debug(`📈 Updated kiosk ${kioskId} active queue count`);
      }

      // Calculate position for this specific service type
      let positionQuery = `
        SELECT COUNT(*) FROM queue 
        WHERE status='waiting' AND created_at <= $1
      `;
      const positionParams = [created_at];
      
      if (serviceType) {
        positionQuery += ` AND (service_type = $2 OR service_type IS NULL)`;
        positionParams.push(serviceType);
      }

      const posResult = await client.query(positionQuery, positionParams);
      const position = parseInt(posResult.rows[0].count, 10);
      this.logger.debug(`📊 Queue position calculated: ${position} for service: ${serviceType}`);

      // Prepare messages with service type information
      const serviceInfo = serviceType ? ` for ${serviceType}` : '';
      const welcomeMsg = `👋 Hi ${name}! Welcome to our Queue Service. You'll get updates here on WhatsApp.`;
      const queueMsg = `✅ Hi ${name}, you joined the queue${serviceInfo}! Your position is ${position}`;

      // Send WhatsApp messages if Twilio is configured
      if (this.twilioClient && this.twilioWhatsAppNumber) {
        try {
          // If new user → send welcome message first
          if (existingUser.rowCount === 0) {
            this.logger.debug(`📤 Sending welcome message to ${phone}`);
            await this.twilioClient.messages.create({
              body: welcomeMsg,
              from: this.twilioWhatsAppNumber,
              to: `whatsapp:${phone}`,
            });
          }

          // Always send queue position message
          this.logger.debug(`📤 Sending queue position message to ${phone}`);
          await this.twilioClient.messages.create({
            body: queueMsg,
            from: this.twilioWhatsAppNumber,
            to: `whatsapp:${phone}`,
          });

          this.logger.log(`✅ WhatsApp messages sent successfully to ${phone}`);
        } catch (whatsappError) {
          this.logger.error('❌ Failed to send WhatsApp notifications:', whatsappError.message);
          // Don't throw here - we still want to return the queue position even if WhatsApp fails
        }
      } else {
        this.logger.warn('⚠️ Twilio not configured, skipping WhatsApp messages');
      }

      return { 
        id, 
        position, 
        newUser: existingUser.rowCount === 0,
        whatsappSent: !!(this.twilioClient && this.twilioWhatsAppNumber),
        serviceType: serviceType || 'General Service',
        kioskId: kioskId
      };

    } catch (error) {
      this.logger.error(`❌ Error in joinQueue: ${error.message}`, error.stack);
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async getQueuePosition(phone: string) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT position FROM (
          SELECT phone, 
                 row_number() over (order by created_at) as position
          FROM queue 
          WHERE status='waiting'
        ) AS numbered_queue 
        WHERE phone = $1`,
        [phone],
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0].position;
    } finally {
      client.release();
    }
  }

  async notifyPositionUpdate(phone: string, name: string, position: number) {
    if (!this.twilioClient || !this.twilioWhatsAppNumber) {
      this.logger.warn('⚠️ Twilio not configured, skipping position update');
      return;
    }

    const message = `📢 Update for ${name}: Your queue position is now ${position}`;

    try {
      await this.twilioClient.messages.create({
        body: message,
        from: this.twilioWhatsAppNumber,
        to: `whatsapp:${phone}`,
      });
      this.logger.log(`✅ Position update sent to ${phone}`);
    } catch (err) {
      this.logger.error('❌ Failed to send position update', err.message);
    }
  }

  async completeService(phone: string) {
    const client = await this.pool.connect();
    try {
      await client.query(
        `UPDATE queue SET status = 'completed' WHERE phone = $1 AND status = 'waiting'`,
        [phone],
      );
      this.logger.log(`✅ Service completed for ${phone}`);
    } finally {
      client.release();
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
        ORDER BY service_type, created_at
      `);

      this.logger.debug(`📊 Found ${result.rows.length} waiting tickets`);

      return result.rows.map((ticket) => ({
        ...ticket,
        customer_name: ticket.customer_name || 'Guest Customer',
        service_type: ticket.service_type || 'General Service',
        ticket_number: ticket.ticket_number || `T${ticket.id.toString().slice(-6)}`,
      }));
    } catch (error) {
      this.logger.error(`❌ Database error in getQueue: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }
}
