import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Optimize for high concurrency
    logger: ['error', 'warn', 'log'],
  });
  
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
  
  app.set('trust proxy', true);
  
  // Optimize for file uploads
  app.use(express.json({ 
    limit: '10mb', // Increased from 5mb for better throughput
    parameterLimit: 50000, // Handle more parameters
  }));
  app.use(express.urlencoded({ 
    limit: '10mb', 
    extended: true,
    parameterLimit: 50000,
  }));
  
  // Serve static files efficiently
  app.useStaticAssets('vebinar-excel', { 
    prefix: '/vebinar-excel',
    maxAge: '1d', // Cache static files for better performance
  });
  
  const PORT = process.env.PORT || 8000;
  
  await app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port: ${PORT}`);
    console.log(`Cluster mode: ${process.env.exec_mode || 'unknown'}`);
    console.log(`Thread pool size: ${process.env.UV_THREADPOOL_SIZE || 4}`);
  });
  
  // Signal PM2 that the app is ready
  if (process.send) {
    process.send('ready');
  }
}
bootstrap();
