import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { generateTextJob } from "@/inngest/functions/generate-text";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateTextJob],
});
