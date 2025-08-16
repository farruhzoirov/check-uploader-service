import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  async uploadFile(files: Express.Multer.File[]) {
    if (!files.length) {
      throw new BadRequestException('File not uploaded');
    }

    const processedFiles = await this.processFiles(files);

    return {
      success: true,
      message: 'Uploaded successfully',
      successCode: 200,
      error: null,
      files: processedFiles,
    };
  }

  async uploadBulkFiles(files: Express.Multer.File[]) {
    if (!files.length) {
      throw new BadRequestException('No files uploaded');
    }

    this.logger.log(`Processing bulk upload of ${files.length} files`);

    try {
      // Process files in batches to avoid memory issues
      const batchSize = 10;
      const processedFiles = [];

      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(file => this.processFiles([file]))
        );
        processedFiles.push(...batchResults.flat());
      }

      return {
        success: true,
        message: `Bulk upload completed: ${processedFiles.length} files processed`,
        successCode: 200,
        error: null,
        files: processedFiles,
        totalFiles: processedFiles.length,
      };
    } catch (error) {
      this.logger.error('Bulk upload failed', error);
      throw new BadRequestException('Bulk upload failed');
    }
  }

  private async processFiles(files: Express.Multer.File[]): Promise<any[]> {
    return Promise.all(
      files.map(async (file) => {
        // If using memory storage, save to disk
        if (file.buffer) {
          await this.saveMemoryFileToDisk(file);
        }

        // Process file metadata
        const processedFile = {
          ...file,
          size: +(file.size / (1024 * 1024)).toFixed(3),
          extension: file.originalname.split('.').pop() || '',
          uploadTimestamp: new Date().toISOString(),
        };

        return processedFile;
      })
    );
  }

  private async saveMemoryFileToDisk(file: Express.Multer.File): Promise<void> {
    const destinationDirectory = path.join('./vebinar-excel');
    
    // Ensure directory exists
    try {
      await fs.access(destinationDirectory);
    } catch {
      await fs.mkdir(destinationDirectory, { recursive: true });
    }

    // Generate filename
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedFileName = file.originalname
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.\-_]/g, '');
    const fileExt = path.extname(sanitizedFileName);
    const baseName = path.basename(sanitizedFileName, fileExt);
    const filename = `${uniquePrefix}-${baseName}${fileExt}`;
    
    const filepath = path.join(destinationDirectory, filename);
    
    // Write file to disk
    await fs.writeFile(filepath, file.buffer);
    
    // Update file object
    file.path = filepath;
    file.filename = filename;
    file.destination = destinationDirectory;
  }
}
