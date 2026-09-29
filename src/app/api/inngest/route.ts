import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { generateTextJob } from "@/inngest/functions/generate-text";
import { scrapeAndAnswerJob } from "@/inngest/functions/scrape-and-answer";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateTextJob, scrapeAndAnswerJob],
});
