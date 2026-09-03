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

  public async ingestFiles(
    files: Express.Multer.File[],
    includesHeaders?: boolean,
  ): Promise<{ message: string; totalFiles: number; totalChunks: number }> {
    let totalChunks = 0;

    await Promise.all(
      files.map(async (file) => {
        const text = await this.documentsService.extractTextFromBuffer(
          file.buffer,
          file.originalname,
          includesHeaders,
        );
        const chunks = this.documentsService.chunkText(text);

        const chunksToSave: ChunkToSave[] = await Promise.all(
          chunks.map(async (chunk) => {
            const vector = await this.ollamaService.textToVector(chunk);
            return {
              text: chunk,
              vector: vector[0],
              sourceFile: file.originalname,
            };
          }),
        );

        await this.qdrantService.savePoints(chunksToSave);
        totalChunks += chunks.length;
      }),
    );

    return {
      message: 'Files successfully ingested',
      totalFiles: files.length,
      totalChunks,
    };
  }
}
