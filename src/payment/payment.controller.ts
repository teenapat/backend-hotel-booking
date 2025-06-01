import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
} from '@nestjs/common';
import {
  CreatePaymentDto,
  CreateSourceDto,
  CreateTokenDto,
} from './dto/create-payment.dto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('source')
  async createSource(@Body() body: CreateSourceDto) {
    return this.paymentService.createPromptPaySource(body.amount);
  }

  @Post('token')
  async createToken(@Body() body: CreateTokenDto) {
    return this.paymentService.createToken(body.card);
  }

  @Post('charge')
  async charge(@Body() body: CreatePaymentDto) {
    if (!body.source && !body.card) {
      throw new BadRequestException(
        'Either source or cardToken must be provided',
      );
    }
    return this.paymentService.createCharge(body.amount, body);
  }

  @Post('webhook')
  async webhook(@Req() req) {
    const event = req.body;
    console.log('🔔 Webhook Event:', event);

    if (event.data?.object === 'charge') {
      const charge = event.data;
      console.log(`Charge ${charge.id} updated: ${charge.status}`);
      // TODO: Update booking/payment status in DB
    }

    return { received: true };
  }
}
