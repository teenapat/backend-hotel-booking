import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class PaymentService {
  private readonly apiUrl = process.env.OMISE_API_URL!;
  private readonly vaultUrl =
    process.env.OMISE_API_VAULT_URL ?? 'https://vault.omise.co';
  private readonly secretKey = process.env.OMISE_SECRET_KEY!;
  private readonly publicKey = process.env.OMISE_PUBLIC_KEY!;

  private getAuthHeader(key: string) {
    const auth = Buffer.from(`${key}:`).toString('base64');
    return `Basic ${auth}`;
  }

  async createPromptPaySource(amount: number) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/sources`,
        {
          amount: amount * 100,
          currency: 'thb',
          type: 'promptpay',
        },
        {
          headers: {
            Authorization: this.getAuthHeader(this.secretKey),
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        'PromptPay source creation failed:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async createToken(card: any) {
    try {
      const response = await axios.post(
        `${this.vaultUrl}/tokens`,
        { card },
        {
          headers: {
            Authorization: this.getAuthHeader(this.publicKey),
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        'Token creation failed:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async createCharge(
    amount: number,
    paymentData: { source?: string; card?: string },
  ) {
    const chargeParams: any = {
      amount: amount * 100,
      currency: 'thb',
      description: 'Hotel Booking Payment',
    };

    if (paymentData.source) {
      chargeParams.source = paymentData.source;
    } else if (paymentData.card) {
      chargeParams.card = paymentData.card;
    } else {
      throw new Error('Either source or card must be provided');
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/charges`,
        chargeParams,
        {
          headers: {
            Authorization: this.getAuthHeader(this.secretKey),
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        'Charge creation failed:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}
