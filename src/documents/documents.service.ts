import { BadRequestException, Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { detectFileType } from './util/detect-file-type.util';

@Injectable()
export class DocumentsService {
  // Tolerance Values which may need to be adjusted based on search quality
  private readonly MIN_CHUNK_RATIO = 0.5;
  private readonly MAX_OVERSHOOT_RATIO = 0.2;

  /**
   * Extract the text of a file
   * @param filePath The path of the file, the text should be extracted from
   * @returns The specified file text
   */
  private async getFileText(filePath: string): Promise<string> {
    const fileText = await readFile(filePath, { encoding: 'utf8' });
    return fileText;
  }

  /**
   * Finds a fitting cut within a text, so no words are cut off, except they exceed the specified tolerance
   * @param text The whole text to search within
   * @param currentPosition the position where the cursor stands
   * @param idealEndPosition the ideal position where the marked text should end
   * @returns The ideal number for a cut in the text
   */
  private findCutPosition(
    text: string,
    currentPosition: number,
    idealEndPosition: number,
  ): number {
    // backwards search for a space, but only valid if it is after the value of current position
    // and within the specified chunk ratio tolerance
    const rawLastSpace = text.lastIndexOf(' ', idealEndPosition);
    const lastSpacePosition =
      rawLastSpace >= currentPosition + this.MIN_CHUNK_RATIO
        ? rawLastSpace
        : -1;

    // search for a space, but only valid if it is within the specified overshoot tolerance
    const rawNextSpace = text.indexOf(' ', idealEndPosition);
    const nextSpacePosition =
      rawNextSpace <= idealEndPosition + this.MAX_OVERSHOOT_RATIO
        ? rawNextSpace
        : -1;

    let cutPosition: number;

    if (nextSpacePosition === -1 && lastSpacePosition === -1) {
      // no space was found, need to do a hard cut
      cutPosition = idealEndPosition;
    } else if (lastSpacePosition === -1) {
      // only nextSpacePosition ist valid
      cutPosition = nextSpacePosition;
    } else if (nextSpacePosition === -1) {
      // only lastSpacePosition ist valid
      cutPosition = lastSpacePosition;
    } else {
      // both valid, take the one more near to idealEndPosition
      cutPosition =
        Math.abs(idealEndPosition - nextSpacePosition) <
        Math.abs(idealEndPosition - lastSpacePosition)
          ? nextSpacePosition
          : lastSpacePosition;
    }

    return cutPosition;
  }

  /**
   * Finds the next Starting position after a cut was made, including a overlap.
   * If there is a space we start from the first space within the defined overlapSize,
   * if not we just take the hard cut as next position.
   * @param text The whole text to search within
   * @param currentPosition The current position for calculating the next position
   * @param cutPosition The last known cut position
   * @param overlapSize The number of characters of the last chunk that should be included within the next chunk.
   * @returns The next startPosition of the cursor as a number
   */
  private findNextStartPosition(
    text: string,
    currentPosition: number,
    cutPosition: number,
    overlapSize: number,
  ): number {
    // Overlap: going the overlapSize specified characters back, but never behind the current Position
    const overlapStart = Math.max(currentPosition, cutPosition - overlapSize);
    const overlapSpacePosition = text.indexOf(' ', overlapStart);

    const nextPosition =
      overlapSpacePosition !== -1 && overlapSpacePosition < cutPosition
        ? overlapSpacePosition + 1
        : cutPosition;

    return nextPosition;
  }

  /**
   * Turns a string into an array of strings
   * @param text The whole string, which you want to turn into smaller chunks
   * @param chunkSize How many characters one chunk should have,
   * (The specified size can vary from -50% to + 20% of the entered value, in case of formattings)
   * @param overlapSize The number of characters which should be taken from the previous chunk
   * into the next one
   * @returns The text param splitted into formatted chunks.
   */
  private chunkText(
    text: string,
    chunkSize: number = 500,
    overlapSize: number = 50,
  ): string[] {
    const textChunks: string[] = [];
    let currentPosition = 0;

    // As long as the end of the text isnt reached
    while (currentPosition < text.length) {
      const idealEndPosition = currentPosition + chunkSize;

      // If the rest of the text would be shorter than the
      // specified chunk size
      if (idealEndPosition >= text.length) {
        textChunks.push(text.slice(currentPosition));
        break;
      }

      const cutPosition = this.findCutPosition(
        text,
        currentPosition,
        idealEndPosition,
      );

      textChunks.push(text.slice(currentPosition, cutPosition));

      currentPosition = this.findNextStartPosition(
        text,
        currentPosition,
        cutPosition,
        overlapSize,
      );
    }

    return textChunks;
  }

  /**
   * Reads the text out of a file and turns it into chunks
   * @param filePath Path of the file for text extraction
   * @returns An array of chunked texts
   */
  public async readAndChunkFile(filePath: string): Promise<string[]> {
    const textOfFile = await this.getFileText(filePath);
    return this.chunkText(textOfFile);
  }

  public async extractTextFromBuffer(
    buffer: Buffer,
    fileName: string,
  ): Promise<string> {
    const fileType = await detectFileType(buffer);

    switch (fileType?.ext) {
      case 'pdf':
        // return extractfromPDF
        break;
      case 'docx':
        // return extractFromWord
        break;
      case 'xlsx':
        // return extractFromExcel
        break;
      case 'txt':
        // return extractFromTextDocument
        break;
      case 'md':
        // return extractFromMdDocument
        break;
      default:
        throw new BadRequestException(
          `${fileName} is not a supported file type`,
        );
    }
  }
}
