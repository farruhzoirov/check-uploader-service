import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadModule } from './upload/upload.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 60000, // 1 minute
          limit: 10, // 10 uploads per minute per IP
        },
        {
          name: 'medium', 
          ttl: 300000, // 5 minutes
          limit: 30, // 30 uploads per 5 minutes per IP
        },
        {
          name: 'long',
          ttl: 3600000, // 1 hour
          limit: 100, // 100 uploads per hour per IP
        },
      ],
      // TODO: For production with clustering, use Redis storage:
      // storage: new ThrottlerStorageRedisService(redisInstance),
    }),
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
