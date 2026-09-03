import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadFilesDto } from './dto/upload-files.dto';

@Controller('ingestion')
export class IngestionController {
  constructor(
    private readonly ingestionsService: IngestionService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/upload')
  @UseInterceptors(FilesInterceptor('files'))
  ingestFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadFilesDto,
  ) {
    return this.ingestionsService.ingestFiles(files, dto.includesHeaders);
  }
}
