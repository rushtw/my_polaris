import { streamText, createTextStreamResponse, toTextStream } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const result = streamText({
    model: groq('openai/gpt-oss-20b'),
    prompt,
  });

  return createTextStreamResponse({ stream: toTextStream({ stream: result.stream }) });
}
