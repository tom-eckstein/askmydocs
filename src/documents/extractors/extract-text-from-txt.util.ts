/**
 * Extracts plain text from a .txt file buffer.
 * @param buffer The raw file buffer
 * @returns The decoded text content
 */
export const extractTextFromTxt = (buffer: Buffer): string => {
  const text = buffer.toString('utf-8');
  return text;
};
