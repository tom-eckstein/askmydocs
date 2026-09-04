import { z } from 'zod';

export const GeminiChatResponseSchema = z.object({
  candidates: z.array(
    z.object({
      content: z.object({
        parts: z.array(
          z.object({
            text: z.string(),
          }),
        ),
      }),
    }),
  ),
});

export type GeminiChatResponse = z.infer<typeof GeminiChatResponseSchema>;
