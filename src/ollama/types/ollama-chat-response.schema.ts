import z from 'zod';

export const OllamaChatResponseSchema = z.object({
  model: z.string(),
  created_at: z.string(),
  message: z.object({
    role: z.string(),
    content: z.string(),
  }),
  done: z.boolean(),
  total_duration: z.number(),
  load_duration: z.number(),
  prompt_eval_count: z.number(),
  prompt_eval_duration: z.number(),
  eval_count: z.number(),
  eval_duration: z.number(),
});

export type OllamaChatResponse = z.infer<typeof OllamaChatResponseSchema>;
