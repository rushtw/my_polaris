import { inngest } from "@/inngest/client";
import { firecrawl } from "@/lib/firecrawl";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

// Keeps the prompt within Groq's free-tier token limits
const MAX_CHARS_PER_PAGE = 6000;

export const scrapeAndAnswerJob = inngest.createFunction(
  // triggers.event: just a string, not a file or URL path (the "/" is only a naming convention).
  // It must exactly match the `name` sent by inngest.send in src/app/api/demo/demo2/route.ts,
  // otherwise this function never runs.
  { id: "scrape-and-answer", triggers: { event: "demo2/scrape-and-answer" } },
  async ({ event, step }) => {
    const { urls, question } = event.data as { urls: string[]; question: string };

    // One step per URL, all running in parallel. A failed scrape retries on its own.
    const pages = await Promise.all(
      urls.map((url, i) =>
        step.run(`scrape-url-${i + 1}`, async () => {
          const doc = await firecrawl.scrape(url, {
            formats: ["markdown"],
            onlyMainContent: true,
          });
          return {
            url,
            title: doc.metadata?.title ?? url,
            markdown: (doc.markdown ?? "").slice(0, MAX_CHARS_PER_PAGE),
          };
        })
      )
    );

    // Runs only after every scrape step has succeeded
    const answer = await step.run("generate-answer", async () => {
      const context = pages
        .map((page, i) => `[${i + 1}] ${page.title} (${page.url})\n${page.markdown}`)
        .join("\n\n---\n\n");

      const { text } = await generateText({
        model: groq("openai/gpt-oss-20b"),
        system:
          "Answer the question using only the provided sources. Cite sources as [1], [2], etc. If the sources don't contain the answer, say so.",
        prompt: `Sources:\n\n${context}\n\nQuestion: ${question}`,
      });
      return text;
    });

    return {
      question,
      answer,
      sources: pages.map((page, i) => `[${i + 1}] ${page.title} (${page.url})`),
    };
  }
);
