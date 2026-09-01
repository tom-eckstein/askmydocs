import { Injectable } from '@nestjs/common';
import { DocumentsService } from 'src/documents/documents.service';
import { OllamaService } from 'src/ollama/ollama.service';
import { QdrantService } from 'src/qdrant/qdrant.service';
import { ChunkToSave } from 'src/qdrant/types/chunk-to-save.interface';

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
  ): Promise<{ totalChunks: number; message: string }> {
    const textChunks = await this.documentsService.readAndChunkFile(filePath);

    const chunksToSave: ChunkToSave[] = await Promise.all(
      textChunks.map(async (chunk) => {
        const vector = await this.ollamaService.textToVector(chunk);
        const chunkToSave = {
          text: chunk,
          vector: vector[0],
          sourceFile: filePath,
        };
        return chunkToSave;
      }),
    );

    await this.qdrantService.savePoints(collectionName, chunksToSave);

    return {
      message: 'File successfully ingested',
      totalChunks: textChunks.length,
    };
  }
}
