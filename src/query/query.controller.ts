import { Body, Controller, Post } from '@nestjs/common';
import { QueryService } from './query.service';
import { AskQuestionDto } from './dto/ask-question.dto';

@Controller('query')
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @Post()
  public async queryRag(@Body() dto: AskQuestionDto) {
    return await this.queryService.askQuestion(dto.question);
  }
}
