import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: ['https://excelpro-booking.netlify.app', 'http://localhost:4200'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept-Language',
      'App-Type',
      'Accept',
    ],
  });

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ limit: '5mb', extended: true }));
  app.useStaticAssets('vebinar-excel', { prefix: '/vebinar-excel' });
  const PORT = 8000;
  await app.listen(PORT, () => {
    console.log('Server is running on:', PORT);
  });
}
bootstrap();
