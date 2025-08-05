import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Performance optimizations
    bodyParser: true,
    cors: true,
  });
  
  // CORS configuration
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization, Accept-Language, App-Type, Accept',
    credentials: false, // Set to true if you need cookies/auth
  });
  
  // Security and performance middleware
  app.use((req, res, next) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Performance headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    next();
  });

  // Static file serving with caching
  app.useStaticAssets('vebinar-excel', { 
    prefix: '/vebinar-excel',
    maxAge: process.env.NODE_ENV === 'production' ? 86400000 : 0, // 1 day cache in production
  });

  // Global request size limits for performance
  app.use((req, res, next) => {
    if (req.url !== '/upload/file') {
      // Limit non-upload requests to 1MB
      req.on('data', (chunk) => {
        if (req.socket.bytesRead > 1024 * 1024) {
          res.status(413).send('Request too large');
          return;
        }
      });
    }
    next();
  });

  const PORT = process.env.PORT || 8000;
  const HOST = process.env.HOST || '0.0.0.0'; // Bind to all interfaces for containerization
  
  await app.listen(PORT, HOST, () => {
    console.log(`🚀 Server is running on: http://${HOST}:${PORT}`);
    console.log(`📁 Upload directory: vebinar-excel`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔄 Process PID: ${process.pid}`);
  });
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully');
  process.exit(0);
});

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
