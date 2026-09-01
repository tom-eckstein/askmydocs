import z from 'zod';

export const QdrantPayloadSchema = z.object({
  text: z.string(),
  sourceFile: z.string(),
});

export type QdrantPayload = z.infer<typeof QdrantPayloadSchema>;
