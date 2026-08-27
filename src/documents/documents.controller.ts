import { Controller, Get } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { ConfigService } from '@nestjs/config';

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentService: DocumentsService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async getFileText(): Promise<string[]> {
    const filePath = this.configService.get<string>('Test_FILE_PATH');
    if (!filePath) {
      throw new Error('TEST_FILE_PATH is not defined in environment variables');
    }
    return await this.documentService.readAndChunkFile(filePath);
  }
}
