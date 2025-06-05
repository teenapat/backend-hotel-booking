import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import * as Omise from 'omise';
import {
  CreatePaymentDto,
  CreateSourceDto,
  CreateTokenDto,
} from './dto/create-payment.dto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  private readonly omise = Omise({
    publicKey: process.env.OMISE_PUBLIC_KEY!,
    secretKey: process.env.OMISE_SECRET_KEY!,
  });
  private readonly omiseSecretKey = process.env.OMISE_SECRET_KEY!;

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
  @HttpCode(200)
  async handleWebhook(@Req() req: Request) {
    const rawBody = (req.body as Buffer).toString('utf8');
    const event = JSON.parse(rawBody);
    const eventId = event.id;

    const verified = await this.omise.events.retrieve(eventId);

    if (
      verified?.key === 'charge.create' &&
      verified?.data?.status === 'successful'
    ) {
      await this.paymentService.saveWebhookEvent(verified.key, verified.data);
    }

    return { received: true };
  }
}
