import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  async uploadFile(files: Express.Multer.File[]) {
    if (!files.length) {
      throw new BadRequestException('File not uploaded');
    }

    files.forEach((file) => {
      file.size = +(file.size / (1024 * 1024)).toFixed(3);
      file['extension'] = file.originalname.split('.').pop() || '';
    });

    return {
      success: true,
      message: 'Uploaded successfully',
      succesCode: 200,
      error: null,
      files,
    };
  }
}
