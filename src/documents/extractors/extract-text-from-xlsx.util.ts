import { BadRequestException, Logger } from '@nestjs/common';
import * as XLSX from 'xlsx';

const logger = new Logger('XlsxExtractor');

/**
 * Extracts text content from an XLSX file buffer, including sheet names and column headers.
 * @param buffer The raw XLSX file buffer
 * @returns The extracted text content, formatted per sheet and row
 */
export const extractTextFromXlsx = (buffer: Buffer): string => {
  try {
    const workbook = XLSX.read(buffer);
    const sheetTexts = workbook.SheetNames.map((sheetName) => {
      const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      const rows = rawRows.map((row: Record<string, unknown>) =>
        Object.entries(row)
          .map(([key, value]) => `${key}: ${String(value)}`)
          .join(', '),
      );
      return `Sheet: ${sheetName}\n${rows.join('\n')}`;
    });
    return sheetTexts.join('\n\n');
  } catch (error) {
    logger.error(
      'Failed to parse Excel file',
      error instanceof Error ? error.stack : String(error),
    );
    throw new BadRequestException(
      `The XLSX file couldn't be read, it's probably malformed`,
    );
  }
};
