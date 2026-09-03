import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadFilesDTO } from './dto/upload-files.dto';
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILES_PER_UPLOAD,
} from 'src/common/constants/upload.constants';

@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionsService: IngestionService) {}

  @Post('/upload')
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES_PER_UPLOAD, {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
    }),
  )
  ingestFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadFilesDTO,
  ) {
    return this.ingestionsService.ingestFiles(files, dto.includesHeaders);
  }
}
