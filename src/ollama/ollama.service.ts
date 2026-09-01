import { Injectable } from '@nestjs/common';
import { OllamaEmbedResponseSchema } from './types/ollama-embed-response.schema';
import {
  OllamaChatResponse,
  OllamaChatResponseSchema,
} from './types/ollama-chat-response.schema';

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

    const httpResponse = await fetch('http://localhost:11434/api/embed', {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    const parsedBody: unknown = await httpResponse.json();
    if (
      typeof parsedBody === 'object' &&
      parsedBody !== null &&
      'error' in parsedBody
    ) {
      throw new Error(`Ollama error: ${String(parsedBody.error)}`);
    }

    const embedResponse = OllamaEmbedResponseSchema.parse(parsedBody);

    return embedResponse.embeddings;
  }

  public async generateAnswer(prompt: string): Promise<OllamaChatResponse> {
    const requestBody = {
      model: 'llama3.1:8b',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    };

    const headers = {
      'Content-Type': 'application/json',
    };

    const httpResponse = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    const parsedBody: unknown = await httpResponse.json();

    if (
      typeof parsedBody === 'object' &&
      parsedBody !== null &&
      'error' in parsedBody
    ) {
      throw new Error(`Ollama error: ${String(parsedBody.error)}`);
    }
    const chatResponse = OllamaChatResponseSchema.parse(parsedBody);

    return chatResponse;
  }
}
