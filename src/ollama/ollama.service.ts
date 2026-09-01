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

    const rawResponse = await fetch('http://localhost:11434/api/embed', {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    const rawJson: unknown = await rawResponse.json();
    if (typeof rawJson === 'object' && rawJson !== null && 'error' in rawJson) {
      throw new Error(`Ollama error: ${String(rawJson.error)}`);
    }

    const jsonResponse = OllamaEmbedResponseSchema.parse(rawJson);

    return jsonResponse.embeddings;
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

    const rawResponse = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });
    const rawJson: unknown = await rawResponse.json();
    if (typeof rawJson === 'object' && rawJson !== null && 'error' in rawJson) {
      throw new Error(`Ollama error: ${String(rawJson.error)}`);
    }
    const jsonResponse = OllamaChatResponseSchema.parse(rawJson);

    return jsonResponse;
  }
}
