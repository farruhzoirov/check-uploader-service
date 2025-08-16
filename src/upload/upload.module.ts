import { BadRequestException, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { diskStorage, memoryStorage } from 'multer';

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
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return cb(new BadRequestException('File size larger than limit!'), false);
  }
  return cb(null, true);
};

// For high performance uploads, use memory storage for small files
// and stream them to disk to reduce I/O blocking
const getStorage = () => {
  // Use memory storage for better performance with concurrent uploads
  // Files will be processed in memory and then streamed to disk
  if (process.env.UPLOAD_STRATEGY === 'memory') {
    return memoryStorage();
  }
  
  // Default disk storage with optimizations
  return diskStorage({
    destination: async (req, file, cb) => {
      const destinationDirectory = path.join('./vebinar-excel');
      if (!fs.existsSync(destinationDirectory)) {
        await fs.promises.mkdir(destinationDirectory, { recursive: true });
      }
      cb(null, destinationDirectory);
    },
    filename: (req, file, cb) => {
      const uniquePrefix =
        Date.now() + '-' + Math.round(Math.random() * 1e9);
      const sanitizedFileName = file.originalname
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9.\-_]/g, '');
      const fileExt = path.extname(sanitizedFileName);
      const baseName = path.basename(sanitizedFileName, fileExt);
      cb(null, `${uniquePrefix}-${baseName}${fileExt}`);
    },
  });
};

@Module({
  imports: [
    MulterModule.register({
      storage: getStorage(),
      fileFilter: fileFilter,
      // Optimize for concurrent uploads
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 10, // Allow up to 10 files per request
        fields: 20, // Increase field limit
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
