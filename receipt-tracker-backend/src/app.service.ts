import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface ContactFormDto {
  name: string;
  email: string;
  message: string;
}

@Injectable()
export class AppService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Initialize nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port: parseInt(this.configService.get<string>('SMTP_PORT') || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  getHello(): string {
    return 'Hello World!';
  }

  async sendContactEmail(contactData: ContactFormDto): Promise<void> {
    const recipientEmail =
      this.configService.get<string>('CONTACT_EMAIL') || 'alishojaa88@gmail.com';

    const mailOptions = {
      from: `"${contactData.name}" <${this.configService.get<string>('SMTP_USER')}>`,
      to: recipientEmail,
      replyTo: contactData.email,
      subject: `New Contact Form Message from ${contactData.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        <p><strong>Message:</strong></p>
        <p>${contactData.message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>This message was sent from the Receipt Tracker contact form.</small></p>
      `,
      text: `
New Contact Form Submission

Name: ${contactData.name}
Email: ${contactData.email}

Message:
${contactData.message}

---
This message was sent from the Receipt Tracker contact form.
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
