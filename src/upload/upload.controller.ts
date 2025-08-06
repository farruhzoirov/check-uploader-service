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

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @HttpCode(HttpStatus.OK)
  @Post('file')
  @UseInterceptors(FilesInterceptor('file', 1))
  async uploadFile(@UploadedFiles() files: Express.Multer.File[]) {
    return this.uploadService.uploadFile(files);
  }
}
