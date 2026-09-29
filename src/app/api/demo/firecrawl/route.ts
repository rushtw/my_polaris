import { firecrawl } from "@/lib/firecrawl";

export async function POST(request: Request) {
  // Debug logging: prints in the Next Dev terminal, not the browser. Remove when done.
  // console.log("method:", request.method);
  // console.log("request url:", request.url);
  // const headers = Object.fromEntries(request.headers);
  // delete headers.cookie; // holds your Clerk session token, keep it out of logs
  // console.log("headers:", headers);

  const body = await request.json(); // It needs await because the body arrives as a stream
  // console.log("body:", body, "| type:", typeof body);

  const { url } = body;
  // console.log("url:", url, "| type:", typeof url);

  try {
    const doc = await firecrawl.scrape(url, {
      formats: ["markdown"],
      onlyMainContent: true,
    });

  //  console.log("doc:", doc);


    return Response.json({
      title: doc.metadata?.title,
      sourceURL: doc.metadata?.sourceURL,
      statusCode: doc.metadata?.statusCode,
      markdown: doc.markdown,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scrape failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
