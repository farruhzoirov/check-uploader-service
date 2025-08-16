import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @HttpCode(HttpStatus.OK)
  @Post('file')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 uploads per minute per IP
  @UseInterceptors(FilesInterceptor('file', 10)) // Allow up to 10 files
  async uploadFile(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadService.uploadFile(files);
  }

  @HttpCode(HttpStatus.OK)
  @Post('bulk')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 bulk uploads per minute per IP
  @UseInterceptors(FilesInterceptor('files', 50)) // Allow up to 50 files for bulk upload
  async uploadBulkFiles(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadService.uploadBulkFiles(files);
  }
}
