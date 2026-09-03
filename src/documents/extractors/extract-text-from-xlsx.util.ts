import { BadRequestException, Logger } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { ExtractedContent } from '../types/extracted-content.interface';

const logger = new Logger('XlsxExtractor');

/**
 * Extracts text content from an XLSX file buffer, including sheet names and column headers.
 * @param buffer The raw XLSX file buffer
 * @returns The extracted text content, formatted per sheet and row
 */
export const extractTextFromXlsx = async (
  buffer: Buffer,
  includesHeaders: boolean = true,
): Promise<ExtractedContent> => {
  try {
    const workbook = new Workbook();
    // ExcelJS's type definitions haven't been updated for newer TypeScript Buffer generics (see: https://github.com/exceljs/exceljs/issues/2877).
    // This is a known, unresolved upstream typing bug — the runtime behavior is correct, only the type declaration is wrong.
    // eslint-disable-next-line
    await workbook.xlsx.load(buffer as any);

    const allRowTexts: string[] = [];
    workbook.eachSheet((worksheet) => {
      let headers: string[] = [];

      worksheet.eachRow((row, rowNumber) => {
        const values = (row.values as unknown[])
          .slice(1)
          .map((value) => String(value));

        if (rowNumber === 1 && includesHeaders === true) {
          headers = values;
        } else {
          const rowText = `[${worksheet.name}] ${values
            .map(
              (value, index) =>
                `${headers.length !== 0 ? headers[index] : `Spalte ${index + 1}`}: ${value}`,
            )
            .join(', ')}`;
          allRowTexts.push(rowText);
        }
      });
    });

    return { type: 'tabular', content: allRowTexts };
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
