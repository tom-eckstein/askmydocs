import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { DocumentsService } from 'src/documents/documents.service';
import { OllamaService } from 'src/ollama/ollama.service';
import { QdrantService } from 'src/qdrant/qdrant.service';

@Module({
  providers: [IngestionService, DocumentsService, OllamaService, QdrantService],
  controllers: [IngestionController],
})
export class IngestionModule {}
