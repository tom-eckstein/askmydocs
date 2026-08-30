import {
  BadGatewayException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
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

  public async createCollection(collectionName: string): Promise<void> {
    try {
      await this.client.createCollection(collectionName, {
        vectors: {
          size: 768,
          distance: 'Cosine',
        },
      });
    } catch (error) {
      if (error instanceof TypeError) {
        this.logger.error(error.message, error?.stack);
        throw new BadGatewayException({
          statusCode: HttpStatus.BAD_GATEWAY,
          message:
            'Connection to the partner service failed. Please try again later.',
        });
      } else if (error instanceof Error) {
        this.logger.error(error.message, error.stack);
        throw new InternalServerErrorException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal Server Error',
        });
      } else {
        this.logger.error('An unknown error occurred', String(error));
        throw new InternalServerErrorException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal Server Error',
        });
      }
    }
  }
}
