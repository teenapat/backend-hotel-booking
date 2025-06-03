import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import * as crypto from 'crypto';
import {
  CreatePaymentDto,
  CreateSourceDto,
  CreateTokenDto,
} from './dto/create-payment.dto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
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
  async handleWebhook(
    @Headers('X-Omise-Signature') omiseSignature: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const rawBody = req.rawBody || JSON.stringify(body);
    const computedSignature = crypto
      .createHmac('sha256', this.omiseSecretKey)
      .update(rawBody, 'utf8')
      .digest('base64');

    if (computedSignature !== omiseSignature) {
      throw new BadRequestException('Invalid signature');
    }

    const charge = body.data;
    if (charge?.object === 'charge') {
      if (charge.status === 'successful') {
        console.log(`Charge successful: ${charge.id}`);
      } else if (charge.status === 'failed') {
        console.log(
          `Charge failed: ${charge.id}, Reason: ${charge.failure_code}`,
        );
      }
    }

    return { received: true };
  }
}
