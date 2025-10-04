import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import AT from 'africastalking';
import { WhatsAppService } from '../whatsapp/whatsapp.service';

@Injectable()
export class QueueService {
  private pool: Pool;
  private africasTalking: any;
  private sms: any;

  constructor(
    private config: ConfigService,
    private whatsappService: WhatsAppService,
  ) {
    // PostgreSQL connection
    this.pool = new Pool({ connectionString: this.config.get('DATABASE_URL') });

    // Africa's Talking setup
    this.africasTalking = AT({
      username: this.config.get('AT_USERNAME'),
      apiKey: this.config.get('AT_API_KEY'),
    });
    this.sms = this.africasTalking.SMS;
  }

  async joinQueue(phone: string, name: string) {
    // Insert into queue
    const result = await this.pool.query(
      `INSERT INTO queue (phone, name) VALUES ($1, $2) RETURNING id, created_at`,
      [phone, name],
    );

    const { id, created_at } = result.rows[0];

    // Calculate position dynamically
    const posResult = await this.pool.query(
      `SELECT COUNT(*) FROM queue WHERE status='waiting' AND created_at <= $1`,
      [created_at],
    );
    const position = parseInt(posResult.rows[0].count, 10);

    try {
      // --- Africa's Talking SMS ---
      const smsResponse = await this.sms.send({
        to: [phone],
        message: `Hi ${name}, you joined the queue! Your position is ${position}`,
        from: this.config.get('AT_SHORTCODE'),
      });
      console.log('✅ Africa\'s Talking SMS Response:', smsResponse);

      // --- Meta WhatsApp ---
      // const waResponse = await this.whatsappService.sendWelcomeMessage(phone, name, position);
      // console.log('✅ Meta WhatsApp Response:', waResponse);

    } catch (err) {
      console.error('❌ Failed to send notifications:', err);
    }

    return { id, position };
  }

  async getQueue() {
    const result = await this.pool.query(
      `SELECT id, phone, name, status, created_at,
      row_number() over (order by created_at) as position
      FROM queue WHERE status='waiting'`,
    );
    return result.rows;
  }
  
  //async testWhatsApp(): Promise<any> {
    //return await this.whatsappService.testConnection();
  //}
}
