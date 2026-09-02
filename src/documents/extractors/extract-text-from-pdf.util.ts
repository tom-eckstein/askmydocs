import { BadRequestException, Logger } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

const logger = new Logger('PdfExtractor');

/**
 * Extracts text content from a PDF file buffer.
 * @param buffer The raw PDF file buffer
 * @returns The extracted text content
 */
export const extractTextFromPdf = async (buffer: Buffer): Promise<string> => {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text;
  } catch (error) {
    logger.error(
      'Failed to parse PDF',
      error instanceof Error ? error.stack : String(error),
    );
    throw new BadRequestException(
      `The PDF file couldn't be read, it's probably malformed`,
    );
  } finally {
    await parser.destroy();
  }
};
