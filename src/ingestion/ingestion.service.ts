import { Injectable } from '@nestjs/common';
import { DocumentsService } from 'src/documents/documents.service';
import { OllamaService } from 'src/ollama/ollama.service';
import { QdrantService } from 'src/qdrant/qdrant.service';

@Injectable()
export class IngestionService {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly ollamaService: OllamaService,
    private readonly qdrantService: QdrantService,
  ) {}

  public async ingestFile(
    filePath: string,
    collectionName: string,
  ): Promise<{ totalChunks: number; savedCount: number }> {
    const textChunks = await this.documentsService.readAndChunkFile(filePath);
    let savedCount = 0;

    const promises = textChunks.map(async (chunk) => {
      const vector = await this.ollamaService.textToVector(chunk);
      const savedPoint = await this.qdrantService.savePoint(
        collectionName,
        chunk,
        vector[0],
        filePath,
      );
      savedCount++;
      return savedPoint;
    });
    await Promise.all(promises);

    return {
      totalChunks: textChunks.length,
      savedCount,
    };
  }
}
