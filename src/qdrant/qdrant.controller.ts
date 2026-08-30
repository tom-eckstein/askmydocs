import { Controller, Get } from '@nestjs/common';
import { QdrantService } from './qdrant.service';

@Controller('qdrant')
export class QdrantController {
  constructor(private readonly qdrantService: QdrantService) {}

  @Get('/test')
  public async testQdrant() {
    return await this.qdrantService.createCollection('test');
  }
}
