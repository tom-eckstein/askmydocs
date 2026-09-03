import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';

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
});
