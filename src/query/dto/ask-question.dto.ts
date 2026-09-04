import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const AskQuestionSchema = z.object({
  question: z.string().min(1, 'Question must not be empty'),
});

export class AskQuestionDto extends createZodDto(AskQuestionSchema) {}
