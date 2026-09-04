import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { detectFileType } from './util/detect-file-type.util';
import { BadRequestException } from '@nestjs/common';

jest.mock('./util/detect-file-type.util', () => ({
  detectFileType: jest.fn(),
}));

describe('DocumentsService', () => {
  let service: DocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentsService],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the whole text as a single chunk if it is shorter than chunkSize', () => {
    const shortText = 'This is a shortText';
    const result = service.chunkText(shortText);

    expect(result).toEqual([shortText]);
  });

  it('should group rows into chunks', () => {
    const rows = ['Zeile 1', 'Zeile 2', 'Zeile 3', 'Zeile 4', 'Zeile 5'];
    const result = service.chunkRows(rows, 2);

    const expectedFirstChunk = ['Zeile 1', 'Zeile 2'].join('\n');
    const expectedSecondChunk = ['Zeile 3', 'Zeile 4'].join('\n');

    expect(result).toEqual([
      expectedFirstChunk,
      expectedSecondChunk,
      'Zeile 5',
    ]);
  });

  it.each([
    ['txt', 'text'],
    ['md', 'text'],
  ])('should return type %s for a .%s file', async (ext, expectedType) => {
    (detectFileType as jest.Mock).mockReturnValue({ ext });

    const buffer = Buffer.from('Hello, world!');
    const result = await service.extractTextFromBuffer(buffer, `test.${ext}`);

    expect(result.type).toBe(expectedType);
    if (result.type === 'text') {
      expect(result.content).toBe('Hello, world!');
    }
  });

  it('should throw an error for unsupported file types', async () => {
    (detectFileType as jest.Mock).mockReturnValue({ ext: 'exe' });

    const buffer = Buffer.from('test');

    await expect(
      service.extractTextFromBuffer(buffer, 'malware.exe'),
    ).rejects.toThrow(BadRequestException);
  });
});
