import { BadRequestException, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { diskStorage } from 'multer';

const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
  const allowMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/svg+xml',
    'image/webp',
    'application/pdf',
  ];
  console.log(file);
  if (!allowMimeTypes.includes(file.mimetype.toLowerCase())) {
    return cb(new BadRequestException('Invalid file type'), false);
  }
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return cb(new BadRequestException('File size larger than limit!'), false);
  }
  return cb(null, true);
};

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
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
            .replace(/\s+/g, '-');
          cb(null, `${uniquePrefix}-${sanitizedFileName}`);
        },
      }),
      fileFilter: fileFilter,
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
