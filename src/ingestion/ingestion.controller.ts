import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('ingestion')
export class IngestionController {
  constructor(
    private readonly ingestionsService: IngestionService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/upload')
  @UseInterceptors(FilesInterceptor('files'))
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    console.log(files);
    return {
      receivedFiles: files.map((f) => f.originalname),
    };
  }
}
