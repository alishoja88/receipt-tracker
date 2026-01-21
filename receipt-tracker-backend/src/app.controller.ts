import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AppService, ContactFormDto } from './app.service';
import { Public } from './modules/auth/presentation';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Post('contact')
  async sendContactEmail(@Body() contactData: ContactFormDto) {
    try {
      await this.appService.sendContactEmail(contactData);
      return {
        success: true,
        message: 'Thank you for your message! We will get back to you soon.',
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to send message. Please try again.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
