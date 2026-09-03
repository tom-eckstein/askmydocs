import mammoth from 'mammoth';
import { BadRequestException, Logger } from '@nestjs/common';

const logger = new Logger('DocxExtractor');

/**
 * Extracts text content from a DOCX file buffer.
 * @param buffer The raw DOCX file buffer
 * @returns The extracted text content
 */
export const extractTextFromDocx = async (buffer: Buffer): Promise<string> => {
  try {
    const result = await mammoth.extractRawText({ buffer });

    if (result.messages.length > 0) {
      logger.warn(
        `Warnings while extracting docx: ${JSON.stringify(result.messages)}`,
      );
    }

    return result.value;
  } catch (error) {
    logger.error(
      'Failed to parse Word document',
      error instanceof Error ? error.stack : String(error),
    );
    throw new BadRequestException(
      `The DOCX file couldn't be read, it's probably malformed`,
    );
  }
};
