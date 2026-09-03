export interface TextContent {
  type: 'text';
  content: string;
}

export interface TabularContent {
  type: 'tabular';
  content: string[];
}

export interface MixedContent {
  type: 'mixed';
  text: string;
  rows: string[];
}

export type ExtractedContent = TextContent | TabularContent | MixedContent;
