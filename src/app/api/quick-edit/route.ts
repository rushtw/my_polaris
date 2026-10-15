import { z } from "zod";
import { generateText, Output } from "ai";
import { groq } from "@ai-sdk/groq";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { firecrawl } from "@/lib/firecrawl";

// What the AI must return: JSON { editedCode: "..." }
const quickEditSchema = z.object({
  editedCode: z
    .string()
    .describe("The edited version of the selected code based on the instruction"),
});

// What the editor sends (see the form in extensions/quick-edit)
const requestSchema = z.object({
  selectedCode: z.string().min(1),
  fullCode: z.string(),
  instruction: z.string().trim().min(1),
});

const URL_REGEX = /https?:\/\/[^\s)>\]]+/g;

const QUICK_EDIT_PROMPT = `You are a code editing assistant. Edit the selected code based on the user's instruction.

<context>
<selected_code>
{selectedCode}
</selected_code>
<full_code_context>
{fullCode}
</full_code_context>
</context>

{documentation}

<instruction>
{instruction}
</instruction>

<instructions>
Return ONLY the edited version of the selected code.
Maintain the same indentation level as the original.
Do not include any explanations or comments unless requested.
If the instruction is unclear or cannot be applied, return the original code unchanged.
</instructions>`;

// URLs in the instruction (e.g. a docs page) are scraped with Firecrawl and
// added to the prompt as documentation. A URL that fails is simply skipped.
const scrapeDocumentation = async (instruction: string) => {
  const urls = instruction.match(URL_REGEX) ?? [];
  if (urls.length === 0) return "";

  const docs = await Promise.all(
    urls.map(async (url) => {
      try {
        const result = await firecrawl.scrape(url, { formats: ["markdown"] });
        return result.markdown ? `<doc url="${url}">\n${result.markdown}\n</doc>` : null;
      } catch {
        return null;
      }
    }),
  );

  const found = docs.filter(Boolean);
  return found.length > 0 ? `<documentation>\n${found.join("\n\n")}\n</documentation>` : "";
};

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { selectedCode, fullCode, instruction } = parsed.data;

  try {
    const documentation = await scrapeDocumentation(instruction);

    // Function replacements, so a "$" in the code isn't treated as a special pattern
    const prompt = QUICK_EDIT_PROMPT.replace("{selectedCode}", () => selectedCode)
      .replace("{fullCode}", () => fullCode)
      .replace("{documentation}", () => documentation)
      .replace("{instruction}", () => instruction);

    const { output } = await generateText({
      model: groq("openai/gpt-oss-20b"),
      output: Output.object({ schema: quickEditSchema }),
      prompt,
      abortSignal: request.signal, // stop if the user pressed Cancel
    });

    return NextResponse.json({ editedCode: output.editedCode });
  } catch (error) {
    console.error("Quick edit error:", error);
    return NextResponse.json({ error: "Failed to generate edit" }, { status: 500 });
  }
}
