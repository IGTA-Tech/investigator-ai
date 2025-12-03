import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Default model
export const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

// Helper to create a message with Claude
export async function createMessage(params: {
  messages: Anthropic.MessageParam[];
  system?: string;
  max_tokens?: number;
  temperature?: number;
  tools?: Anthropic.Tool[];
}) {
  try {
    const message = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: params.max_tokens || 4096,
      temperature: params.temperature || 0.3,
      system: params.system,
      messages: params.messages,
      tools: params.tools,
    });

    return { success: true, data: message, error: null };
  } catch (error: any) {
    console.error('Claude API Error:', error);
    return { success: false, data: null, error: error.message };
  }
}

// Helper to extract text from Claude response
export function extractTextContent(message: Anthropic.Message): string {
  const textBlocks = message.content.filter(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );
  return textBlocks.map(block => block.text).join('\n');
}

// Helper to extract JSON from text
export function extractJSON<T = any>(text: string): T | null {
  try {
    // Try to find JSON in code blocks
    const codeBlockMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      return JSON.parse(codeBlockMatch[1]);
    }

    // Try to find raw JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return null;
  } catch (error) {
    console.error('Failed to extract JSON:', error);
    return null;
  }
}
