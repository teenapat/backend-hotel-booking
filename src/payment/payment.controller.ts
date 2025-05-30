import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('token')
  async createToken(@Body() body: { card: any }) {
    return this.paymentService.createToken(body.card);
  }

  @Post('charge')
  async charge(@Body() body: { amount: number; cardToken: string }) {
    return this.paymentService.createCharge(body.amount, body.cardToken);
  }
}
