import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';

@Injectable()
export class DocumentsService {
  private async getFileText(filePath: string): Promise<string> {
    const fileText = await readFile(filePath, { encoding: 'utf8' });
    return fileText;
  }

  private chunkText(text: string, chunkSize: number = 500): string[] {
    const numOfChunks = Math.ceil(text.length / chunkSize);
    const textChunks: string[] = [];
    for (let i = 0; i < numOfChunks; i++) {
      textChunks.push(text.slice(i * chunkSize, (i + 1) * chunkSize));
    }
    return textChunks;
  }

  public async readAndChunkFile(filePath: string): Promise<string[]> {
    const textOfFile = await this.getFileText(filePath);
    return this.chunkText(textOfFile);
  }
}
