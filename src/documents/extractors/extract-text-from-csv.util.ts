import { BadRequestException, Logger } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { Readable } from 'stream';

const logger = new Logger('CsvExtractor');

/**
 * Extracts text content from a CSV file buffer, using column headers if present.
 * @param buffer The raw CSV file buffer
 * @param includesHeaders Whether the first row contains column headers (default: true)
 * @returns The extracted text content
 */
export const extractTextFromCsv = async (
  buffer: Buffer,
  includesHeaders: boolean = true,
): Promise<string> => {
  try {
    const workbook = new Workbook();
    const stream = Readable.from(buffer);
    await workbook.csv.read(stream);

    let headers: string[] = [];
    const rowTexts: string[] = [];

    workbook.worksheets[0].eachRow((row, rowNumber) => {
      const values = (row.values as unknown[])
        .slice(1)
        .map((value) => String(value));

      if (rowNumber === 1 && includesHeaders === true) {
        headers = values;
      } else {
        const rowText = values
          .map(
            (value, index) =>
              `${headers.length !== 0 ? headers[index] : `Spalte ${index + 1}`}: ${value}`,
          )
          .join(', ');
        rowTexts.push(rowText);
      }
    });

    const sheetText = rowTexts.join('\n');

    return sheetText;
  } catch (error) {
    logger.error(
      'Failed to parse Csv file',
      error instanceof Error ? error.stack : String(error),
    );
    throw new BadRequestException(
      `The CSV file couldn't be read, it's probably malformed`,
    );
  }
};
