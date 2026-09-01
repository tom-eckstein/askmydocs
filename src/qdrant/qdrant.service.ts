import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient, Schemas } from '@qdrant/js-client-rest';
import { ChunkToSave } from './types/chunk-to-save.interface';

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

  public async createCollection(collectionName: string): Promise<void> {
    await this.client.createCollection(collectionName, {
      vectors: {
        size: 768,
        distance: 'Cosine',
      },
    });
  }

  public async savePoint(
    collectionName: string,
    text: string,
    vector: number[],
    sourceFile: string,
  ): Promise<Schemas['UpdateResult']> {
    const savedPoint = await this.client.upsert(collectionName, {
      points: [
        {
          id: crypto.randomUUID(),
          vector,
          payload: {
            text,
            sourceFile,
          },
        },
      ],
    });
    return savedPoint;
  }

  public async savePoints(
    collectionName: string,
    chunks: ChunkToSave[],
  ): Promise<Schemas['UpdateResult']> {
    const pointObjects = chunks.map((el) => {
      return {
        id: crypto.randomUUID(),
        vector: el.vector,
        payload: {
          text: el.text,
          sourceFile: el.sourceFile,
        },
      };
    });

    const savedPoints = await this.client.upsert(collectionName, {
      points: pointObjects,
    });

    return savedPoints;
  }

  public async findSimiliarChunks(
    collectionName: string,
    vector: number[],
    limit: number = 5,
  ): Promise<Schemas['QueryResponse']> {
    const vectors = await this.client.query(collectionName, {
      query: vector,
      limit,
      with_payload: true,
    });
    return vectors;
  }
}
