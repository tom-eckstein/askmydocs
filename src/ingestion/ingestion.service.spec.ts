import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';
import { DocumentsService } from 'src/documents/documents.service';
import { OllamaService } from 'src/ollama/ollama.service';
import { QdrantService } from 'src/qdrant/qdrant.service';

jest.mock('../documents/util/detect-file-type.util', () => ({
  detectFileType: jest.fn(),
}));

describe('IngestionService', () => {
  let service: IngestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: DocumentsService,
          useValue: {
            extractTextFromBuffer: jest.fn(),
            chunkText: jest.fn(),
            chunkRows: jest.fn(),
          },
        },
        {
          provide: OllamaService,
          useValue: {
            textToVector: jest.fn(),
          },
        },
        {
          provide: QdrantService,
          useValue: {
            savePoints: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
