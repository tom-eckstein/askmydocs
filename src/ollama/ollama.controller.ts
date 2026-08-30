import { Controller, Get } from '@nestjs/common';
import { OllamaService } from './ollama.service';

@Controller('ollama')
export class OllamaController {
  constructor(private readonly ollamaService: OllamaService) {}

  @Get('/test')
  async testTextToVector() {
    const response = await this.ollamaService.textToVector('Das ist ein Test');
    return response;
  }
}
