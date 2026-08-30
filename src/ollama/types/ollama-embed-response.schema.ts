import z from 'zod';

export const OllamaEmbedResponseSchema = z.object({
  model: z.string(),
  embeddings: z.array(z.array(z.number())),
  total_duration: z.number(),
  load_duration: z.number(),
  prompt_eval_count: z.number(),
});

export type OllamaEmbedResponse = z.infer<typeof OllamaEmbedResponseSchema>;
