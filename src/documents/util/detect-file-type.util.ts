import { fileTypeFromBuffer, FileTypeResult } from 'file-type';

export const detectFileType = async (
  buffer: Buffer,
): Promise<FileTypeResult | undefined> => {
  const result = await fileTypeFromBuffer(buffer);
  return result;
};
