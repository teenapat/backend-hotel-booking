import { Injectable } from '@nestjs/common';
import * as Omise from 'omise';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class PaymentService {
  private omiseSecret: Omise.IOmise;
  private omisePublic: Omise.IOmise;

  constructor() {
    this.omiseSecret = Omise({
      secretKey: process.env.OMISE_SECRET_KEY,
      omiseVersion: '2020-08-27',
    });

    this.omisePublic = Omise({
      publicKey: process.env.OMISE_PUBLIC_KEY,
      omiseVersion: '2020-08-27',
    });
  }

  async createCharge(amount: number, cardToken: string) {
    return this.omiseSecret.charges.create({
      amount: amount * 100,
      currency: 'thb',
      card: cardToken,
      description: 'Hotel Booking Payment',
    });
  }

  async createToken(card: any) {
    return this.omisePublic.tokens.create({ card });
  }
}
