import { BadRequestException, Module, OnModuleInit } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { diskStorage } from 'multer';

// Cache for directory existence to avoid repeated checks
const directoryCache = new Set<string>();

const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
  const allowMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/svg+xml',
    'image/webp',
    'application/pdf',
  ];
  
  if (!allowMimeTypes.includes(file.mimetype.toLowerCase())) {
    return cb(new BadRequestException('Invalid file type'), false);
  }
  
  // File size validation moved to multer limits for better performance
  return cb(null, true);
};

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: async (req, file, cb) => {
          const destinationDirectory = path.join('./vebinar-excel');
          
          // Use cache to avoid repeated directory checks
          if (!directoryCache.has(destinationDirectory)) {
            try {
              // Use async mkdir with recursive option - more efficient
              await fs.promises.mkdir(destinationDirectory, { recursive: true });
              directoryCache.add(destinationDirectory);
            } catch (error) {
              return cb(error, null);
            }
          }
          
          cb(null, destinationDirectory);
        },
        filename: (req, file, cb) => {
          // More efficient unique ID generation
          const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const sanitizedFileName = file.originalname
            .trim()
            .replace(/[^a-zA-Z0-9.-]/g, '-') // Better sanitization
            .replace(/-+/g, '-'); // Remove duplicate hyphens
          cb(null, `${uniquePrefix}-${sanitizedFileName}`);
        },
      }),
      fileFilter: fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB - moved from fileFilter for better performance
        files: 1, // Limit concurrent files
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule implements OnModuleInit {
  async onModuleInit() {
    // Pre-create upload directory on module initialization
    const uploadDir = path.join('./vebinar-excel');
    try {
      await fs.promises.mkdir(uploadDir, { recursive: true });
      directoryCache.add(uploadDir);
      console.log(`Upload directory initialized: ${uploadDir}`);
    } catch (error) {
      console.error('Failed to initialize upload directory:', error);
    }
  }
}
