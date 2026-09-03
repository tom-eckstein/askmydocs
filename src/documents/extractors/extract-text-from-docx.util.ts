import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import { BadRequestException, Logger } from '@nestjs/common';
import { ExtractedContent } from '../types/extracted-content.interface';

const logger = new Logger('DocxExtractor');

/**
 * Extracts content from a DOCX file buffer, separating regular paragraph text
 * from table data. Tables are detected via their HTML structure after conversion,
 * with header rows identified through <th> cells (falling back to generic
 * column names like "Spalte 1" if no header row is found).
 * @param buffer The raw DOCX file buffer
 * @returns Either plain text content, tabular content, or a mix of both,
 * depending on what the document contains
 */
export const extractTextFromDocx = async (
  buffer: Buffer,
): Promise<ExtractedContent> => {
  try {
    const result = await mammoth.convertToHtml({ buffer });

    if (result.messages.length > 0) {
      logger.warn(
        `Warnings while extracting docx: ${JSON.stringify(result.messages)}`,
      );
    }

    // "$" is the conventional Cheerio variable name (mirrors jQuery's $ syntax) - see https://cheerio.js.org/docs/basics/selecting/
    const $ = cheerio.load(result.value);
    const rows: string[] = [];

    $('table').each((tableIndex, tableElement) => {
      let headers: string[] = [];

      $(tableElement)
        .find('tr')
        .each((_, rowElement) => {
          const headerCells = $(rowElement)
            .find('th')
            .map((_, cell) => $(cell).text().trim())
            .get();

          if (headerCells.length > 0) {
            headers = headerCells;
          } else {
            const values = $(rowElement)
              .find('td, th')
              .map((_, cell) => $(cell).text().trim())
              .get();

            const rowText = values
              .map(
                (val, index) =>
                  `${headers.length !== 0 ? headers[index] : `Spalte ${index + 1}`}: ${val}`,
              )
              .join(', ');

            rows.push(`Table ${tableIndex + 1} ${rowText}`);
          }
        });

      $(tableElement).remove();
    });

    const text = $.text().trim();

    if (rows.length > 0 && text.length > 0) {
      return { type: 'mixed', text, rows };
    } else if (rows.length > 0) {
      return { type: 'tabular', content: rows };
    } else {
      return { type: 'text', content: text };
    }
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
