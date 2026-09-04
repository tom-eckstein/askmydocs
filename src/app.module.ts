import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentsModule } from './documents/documents.module';
import { ConfigModule } from '@nestjs/config';
import { OllamaModule } from './ollama/ollama.module';
import { QdrantModule } from './qdrant/qdrant.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { QueryModule } from './query/query.module';
import { GeminiModule } from './gemini/gemini.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DocumentsModule, OllamaModule, QdrantModule, IngestionModule, QueryModule, GeminiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
