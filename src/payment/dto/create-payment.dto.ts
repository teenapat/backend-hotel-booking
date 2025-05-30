export class CreatePaymentDto {
    amount: number;
    cardToken: string;
}
  
export class CreateTokenDto {
    card: {
      name: string;
      number: string;
      expiration_month: number;
      expiration_year: number;
      security_code: string;
    };
}
  