import { Injectable } from '@nestjs/common';
import { OllamaEmbedResponseSchema } from './types/ollama-embed-response.schema';

@Injectable()
export class OllamaService {
  public async textToVector(text: string): Promise<number[][]> {
    const requestBody = {
      model: 'nomic-embed-text',
      input: text,
    };

    const headers = {
      'Content-Type': 'application/json',
    };

    const rawResponse = await fetch('http://localhost:11434/api/embed', {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    const jsonResponse = OllamaEmbedResponseSchema.parse(
      await rawResponse.json(),
    );

    return jsonResponse.embeddings;
  }
}
