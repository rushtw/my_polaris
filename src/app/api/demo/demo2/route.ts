import { inngest } from "@/inngest/client";

const MAX_URLS = 5;

export async function POST(request: Request) {
  const { urls, question } = await request.json();

  // Original compact version, replaced by the step-by-step checks below:
  // if (!Array.isArray(urls) || urls.length === 0 || urls.length > MAX_URLS) {
  //   return Response.json({ error: `Enter between 1 and ${MAX_URLS} URLs` }, { status: 400 });
  // }
  // if (typeof question !== "string" || !question.trim()) {
  //   return Response.json({ error: "Enter a question" }, { status: 400 });
  // }

  // --- Check the URLs ---

  // 1. urls must be an array, e.g. ["https://a.com", "https://b.com"]
  const urlsIsAnArray = Array.isArray(urls);
  if (urlsIsAnArray === false) {
    return Response.json({ error: `Enter between 1 and ${MAX_URLS} URLs` }, { status: 400 });
  }

  // 2. The array must have at least one URL
  const noUrls = urls.length === 0;
  if (noUrls) {
    return Response.json({ error: `Enter between 1 and ${MAX_URLS} URLs` }, { status: 400 });
  }

  // 3. The array must not have more than MAX_URLS URLs
  const tooManyUrls = urls.length > MAX_URLS;
  if (tooManyUrls) {
    return Response.json({ error: `Enter between 1 and ${MAX_URLS} URLs` }, { status: 400 });
  }

  // --- Check the question ---

  // 4. question must be text (a string)
  const questionIsText = typeof question === "string";
  if (questionIsText === false) {
    return Response.json({ error: "Enter a question" }, { status: 400 });
  }

  // 5. question must not be empty or only spaces (trim() removes spaces at both ends)
  const questionIsBlank = question.trim() === "";
  if (questionIsBlank) {
    return Response.json({ error: "Enter a question" }, { status: 400 });
  }

  // All checks passed, so hand the job to Inngest

  const { ids } = await inngest.send({
    // Event name: just a string, not a file or URL path (the "/" is only a naming convention).
    // It must exactly match `triggers.event` in src/inngest/functions/scrape-and-answer.ts,
    // otherwise the event is received but no function runs.
    name: "demo2/scrape-and-answer",
    data: { urls, question },
  });

  return Response.json({ status: "queued", eventId: ids[0] });
}
