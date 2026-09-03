import { Injectable } from '@nestjs/common';
import { Schemas } from '@qdrant/js-client-rest';
import { OllamaService } from 'src/ollama/ollama.service';
import { QdrantService } from 'src/qdrant/qdrant.service';
import { QdrantPayloadSchema } from 'src/qdrant/types/qdrant-payload.schema';

@Injectable()
export class QueryService {
  constructor(
    private readonly ollamaService: OllamaService,
    private readonly qdrantService: QdrantService,
  ) {}

  public async findRelevantChunks(
    question: string,
  ): Promise<Schemas['QueryResponse']> {
    const questionVector = await this.ollamaService.textToVector(question);
    const foundVectors = await this.qdrantService.findSimiliarChunks(
      questionVector[0],
    );
    return foundVectors;
  }

  private formatContext(chunks: Schemas['ScoredPoint'][]): string {
    const text = chunks.map((el, index) => {
      const payload = QdrantPayloadSchema.parse(el.payload);
      return `Ausschnitt ${index + 1}: ${payload.text} \n\n`;
    });

    return text.join('');
  }

  public async askQuestion(question: string): Promise<string> {
    const relevantPoints = await this.findRelevantChunks(question);
    const formattedTexts = this.formatContext(relevantPoints.points);
    const askingPrompt = `Du bist ein hilfreicher Assistent, der Fragen basierend auf bereitgestellten Dokumentenausschnitten beantwortet.

    Anweisungen:
    1. Beantworte die Frage so gut wie möglich anhand der Informationen im Kontext. Du darfst die Informationen zusammenfassen und in eigenen Worten wiedergeben, auch wenn sie im Kontext nicht wortwörtlich so stehen.
    2. Nutze kein Wissen, das im Widerspruch zum Kontext steht oder komplett unabhängig davon ist.
    3. Nur wenn der Kontext wirklich GAR KEINE relevanten Informationen zur Frage enthält, antworte mit: "Diese Information ist im bereitgestellten Kontext nicht enthalten."

    Kontext:
    ${formattedTexts}

    Frage: ${question}

    Antwort:`;

    const answer = await this.ollamaService.generateAnswer(askingPrompt);

    return answer.message.content;
  }
}
