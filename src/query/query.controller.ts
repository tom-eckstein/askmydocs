import { Controller, Get } from '@nestjs/common';
import { QueryService } from './query.service';

@Controller('query')
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @Get('/test')
  public async queryRag() {
    return await this.queryService.askQuestion('Was ist Docker?');
  }
}
