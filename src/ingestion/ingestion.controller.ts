import { Controller, Get } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { ConfigService } from '@nestjs/config';

@Controller('ingestion')
export class IngestionController {
  constructor(
    private readonly ingestionsService: IngestionService,
    private readonly configService: ConfigService,
  ) {}

  @Get('/test')
  public async testIngestion() {
    const filePath = this.configService.get<string>('TEST_FILE_PATH');
    if (!filePath) {
      throw new Error('TEST_FILE_PATH is not defined in environment variables');
    }
    const ingestionResult = await this.ingestionsService.ingestFile(
      filePath,
      'test',
    );
    return ingestionResult;
  }
}
