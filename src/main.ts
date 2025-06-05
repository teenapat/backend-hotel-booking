import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { AppModule } from './app.module';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/payment/webhook', express.raw({ type: 'application/json' }));

  app.use((req, res, next) => {
    if (req.originalUrl === '/payment/webhook') {
      return next();
    }
    bodyParser.json()(req, res, next);
  });

  await app.listen(3000);
}
bootstrap();
