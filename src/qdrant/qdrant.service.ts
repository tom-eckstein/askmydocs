import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QdrantClient, Schemas } from '@qdrant/js-client-rest';
import { ChunkToSave } from './types/chunk-to-save.interface';
import { DOCUMENTS_COLLECTION_NAME } from 'src/common/constants/qdrant.constants';

@Injectable()
export class QdrantService implements OnModuleInit {
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

  async onModuleInit(): Promise<void> {
    const collectionExists = await this.client.collectionExists(
      DOCUMENTS_COLLECTION_NAME,
    );

    if (!collectionExists.exists) {
      await this.createCollection();
    }
  }

  public async createCollection(): Promise<void> {
    await this.client.createCollection(DOCUMENTS_COLLECTION_NAME, {
      vectors: {
        size: 768,
        distance: 'Cosine',
      },
    });
  }

  public async savePoints(
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

    const savedPoints = await this.client.upsert(DOCUMENTS_COLLECTION_NAME, {
      points: pointObjects,
    });

    return savedPoints;
  }

  public async findSimiliarChunks(
    vector: number[],
    limit: number = 5,
  ): Promise<Schemas['QueryResponse']> {
    const vectors = await this.client.query(DOCUMENTS_COLLECTION_NAME, {
      query: vector,
      limit,
      with_payload: true,
    });
    console.log(JSON.stringify(vectors, null, 2));
    return vectors;
  }
}
