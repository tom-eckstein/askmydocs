import { Test, TestingModule } from '@nestjs/testing';
import { QueryService } from './query.service';
import { OllamaService } from 'src/ollama/ollama.service';
import { QdrantService } from 'src/qdrant/qdrant.service';

describe('QueryService', () => {
  let service: QueryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueryService,
        {
          provide: OllamaService,
          useValue: {
            textToVector: jest.fn(),
          },
        },
        {
          provide: QdrantService,
          useValue: {
            findSimilarChunks: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<QueryService>(QueryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
