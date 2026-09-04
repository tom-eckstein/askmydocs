import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiChatResponseSchema } from './types/gemini-chat-response.schema';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  constructor(private readonly configService: ConfigService) {}

  public async generateAnswer(prompt: string): Promise<string> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      this.logger.fatal(
        'GEMINI_API_KEY is not defined in environment variables',
      );
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    const headers = {
      'Content-Type': 'application/json',
    };

    const httpResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      },
    );

    const parsedBody: unknown = await httpResponse.json();
    if (
      typeof parsedBody === 'object' &&
      parsedBody !== null &&
      'error' in parsedBody
    ) {
      const errorObj = parsedBody.error;

      if (
        typeof errorObj === 'object' &&
        errorObj !== null &&
        'message' in errorObj &&
        typeof errorObj.message === 'string'
      ) {
        throw new Error(`Gemini error: ${errorObj.message}`);
      }

      throw new Error(`Gemini error: ${String(errorObj)}`);
    }

    const chatResponse = GeminiChatResponseSchema.parse(parsedBody);

    return chatResponse.candidates[0].content.parts[0].text;
  }
}
