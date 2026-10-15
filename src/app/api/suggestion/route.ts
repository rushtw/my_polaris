import { z } from "zod";
import { generateText, Output } from "ai";
import { groq } from "@ai-sdk/groq";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// What the AI must return: JSON { suggestion: "..." }, not free text
const suggestionSchema = z.object({
  suggestion: z
    .string()
    .describe("The code to insert at the cursor, or an empty string if no completion is needed"),
});

// What the editor sends (see generatePayload in extensions/suggestion)
const requestSchema = z.object({
  fileName: z.string(),
  code: z.string().min(1),
  currentLine: z.string(),
  previousLines: z.string(),
  textBeforeCursor: z.string(),
  textAfterCursor: z.string(),
  nextLines: z.string(),
  lineNumber: z.number(),
});

const SUGGESTION_PROMPT = `You are a code suggestion assistant.

<context>
<file_name>{fileName}</file_name>
<previous_lines>
{previousLines}
</previous_lines>
<current_line number="{lineNumber}">{currentLine}</current_line>
<before_cursor>{textBeforeCursor}</before_cursor>
<after_cursor>{textAfterCursor}</after_cursor>
<next_lines>
{nextLines}
</next_lines>
<full_code>
{code}
</full_code>
</context>

<instructions>
Follow these steps IN ORDER:

1. First, look at next_lines. If next_lines contains ANY code, check if it continues from where the cursor is. If it does, return empty string immediately - the code is already written.

2. Check if before_cursor ends with a complete statement (;, }, )). If yes, return empty string.

3. Only if steps 1 and 2 don't apply: suggest what should be typed at the cursor position, using context from full_code.

Your suggestion is inserted immediately after the cursor, so never suggest code that's already in the file.
</instructions>`;

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const input = parsed.data;

  // Function replacements, so a "$" in the code isn't treated as a special pattern
  const prompt = SUGGESTION_PROMPT.replace("{fileName}", () => input.fileName)
    .replace("{previousLines}", () => input.previousLines)
    .replace("{lineNumber}", () => String(input.lineNumber))
    .replace("{currentLine}", () => input.currentLine)
    .replace("{textBeforeCursor}", () => input.textBeforeCursor)
    .replace("{textAfterCursor}", () => input.textAfterCursor)
    .replace("{nextLines}", () => input.nextLines)
    .replace("{code}", () => input.code);

  try {
    const { output } = await generateText({
      model: groq("openai/gpt-oss-20b"),
      // Little "thinking" before answering: suggestions must be fast
      providerOptions: { groq: { reasoningEffort: "low" } },
      output: Output.object({ schema: suggestionSchema }),
      prompt,
      abortSignal: request.signal, // stop if the editor aborted the request
    });

    return NextResponse.json({ suggestion: output.suggestion });
  } catch (error) {
    console.error("Suggestion error:", error);
    return NextResponse.json({ error: "Failed to generate suggestion" }, { status: 500 });
  }
}
