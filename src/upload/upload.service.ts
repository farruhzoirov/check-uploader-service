import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  async uploadFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File not uploaded');
    }

    return {
      success: true,
      message: 'Uploaded successfully',
      succesCode: 200,
      error: null,
      path: file.path,
    };
  }
}
