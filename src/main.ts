import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    bodyParser.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf.toString();
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
