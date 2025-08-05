import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders:
      'Content-Type, Authorization, Accept-Language, App-Type, Accept',
  });
  app.useStaticAssets('vebinar-excel', { prefix: '/vebinar-excel' });

  const PORT = 8000;
  await app.listen(PORT, () => {
    console.log('Server is running on:', PORT);
  });
}
bootstrap();
