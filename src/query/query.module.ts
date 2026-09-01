import { Module } from '@nestjs/common';
import { QueryService } from './query.service';
import { QueryController } from './query.controller';
import { OllamaService } from 'src/ollama/ollama.service';
import { QdrantService } from 'src/qdrant/qdrant.service';

@Module({
  providers: [QueryService, OllamaService, QdrantService],
  controllers: [QueryController],
})
export class QueryModule {}
