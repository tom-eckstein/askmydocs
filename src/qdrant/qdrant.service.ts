import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantService {
  private readonly client: QdrantClient;
  private readonly logger = new Logger(QdrantService.name);

  constructor(private readonly configService: ConfigService) {
    const qdrantUrl = this.configService.get<string>('QDRANT_URL');
    if (!qdrantUrl) {
      this.logger.fatal('QDRANT_URL is not defined in environment variables');
      throw new Error('QDRANT_URL is not defined in environment variables');
    }
    this.client = new QdrantClient({ url: qdrantUrl });
  }
}
