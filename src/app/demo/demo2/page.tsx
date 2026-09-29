"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type QueueResult = {
  status?: string;
  eventId?: string;
  error?: string;
};

export default function Demo2Page() {
  const [urlsText, setUrlsText] = useState("");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<QueueResult | null>(null);
  const [loading, setLoading] = useState(false);

  // One URL per line; blank lines are ignored
  const urls = urlsText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const handleClick = async () => {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/demo/demo2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls, question }),
    });
    const data: QueueResult = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="flex w-full max-w-xl flex-col gap-2">
        <Textarea
          placeholder={"One URL per line (up to 5), e.g.\nhttps://quotes.toscrape.com/js/"}
          rows={4}
          value={urlsText}
          onChange={(e) => setUrlsText(e.target.value)}
        />
        <Input
          placeholder="Ask a question about these pages"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <Button
          onClick={handleClick}
          disabled={loading || urls.length === 0 || !question.trim()}
        >
          {loading ? "Queuing..." : `Scrape ${urls.length || ""} & Answer`}
        </Button>
      </div>
      {result?.error && <p className="text-sm text-destructive">{result.error}</p>}
      {result?.eventId && (
        <p className="max-w-xl text-sm text-muted-foreground">
          Queued — event {result.eventId}. Open the Inngest dashboard (localhost:8288) → Runs →
          scrape-and-answer to watch each step and see the answer in the run&apos;s output.
        </p>
      )}
    </main>
  );
}
