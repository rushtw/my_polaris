import { inngest } from "@/inngest/client";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

export const generateTextJob = inngest.createFunction(
  { id: "generate-text", triggers: { event: "text.requested" } },
  async ({ event, step }) => {
    const { text } = await step.run("generate", async () => {
      return generateText({
        model: groq("openai/gpt-oss-20b"),
        prompt: event.data.prompt,
      });
    });

    return text;
  }
);
