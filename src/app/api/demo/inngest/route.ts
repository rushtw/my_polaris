import { inngest } from "@/inngest/client";

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const { ids } = await inngest.send({
    name: "text.requested",
    data: { prompt },
  });

  return Response.json({ status: "queued", eventId: ids[0] });
}
