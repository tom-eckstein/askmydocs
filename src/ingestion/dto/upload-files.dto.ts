import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const uploadFilesSchema = z.object({
  includesHeaders: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? true : val === 'true')),
});

export class UploadFilesDTO extends createZodDto(uploadFilesSchema) {}
