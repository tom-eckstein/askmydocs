import { Module } from '@nestjs/common';
import { QdrantService } from './qdrant.service';

@Module({
  providers: [QdrantService]
})
export class QdrantModule {}
