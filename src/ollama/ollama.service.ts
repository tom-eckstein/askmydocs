import {
  BadGatewayException,
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { OllamaEmbedResponseSchema } from './types/ollama-embed-response.schema';
import { ZodError } from 'zod';

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);

  public async textToVector(text: string): Promise<number[][]> {
    const requestBody = {
      model: 'nomic-embed-text',
      input: text,
    };

    const headers = {
      'Content-Type': 'application/json',
    };

    try {
      const rawResponse = await fetch('http://localhost:11434/api/embed', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      const jsonResponse = OllamaEmbedResponseSchema.parse(
        await rawResponse.json(),
      );

      return jsonResponse.embeddings;
    } catch (error) {
      if (error instanceof ZodError) {
        this.logger.error(error.message, error?.stack);
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.issues.map((el) => ({
            field: el.path[0],
            message: el.message,
          })),
        });
      } else if (error instanceof TypeError) {
        this.logger.error(error.message, error?.stack);
        throw new BadGatewayException({
          statusCode: HttpStatus.BAD_GATEWAY,
          message:
            'Connection to the partner service failed. Please try again later.',
        });
      } else {
        if (error instanceof Error) {
          this.logger.error(error.message, error.stack);
        } else {
          this.logger.error('An unknown error occurred', String(error));
        }
        throw new InternalServerErrorException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal Server Error',
        });
      }
    }
  }
}
