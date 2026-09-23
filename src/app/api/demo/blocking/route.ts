import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const { text } = await generateText({
    model: groq('openai/gpt-oss-20b'),
    prompt,
  });

  return Response.json({ text });
}
