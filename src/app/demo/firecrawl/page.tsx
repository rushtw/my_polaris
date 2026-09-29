"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ScrapeResult = {
  title?: string;
  sourceURL?: string;
  statusCode?: number;
  markdown?: string;
  error?: string;
};

export default function FirecrawlDemoPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/demo/firecrawl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data: ScrapeResult = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="flex w-full max-w-sm gap-2">
        <Input
          placeholder="https://quotes.toscrape.com/js/"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button onClick={handleClick} disabled={loading || !url.trim()}>
          {loading ? "Scraping..." : "Scrape"}
        </Button>
      </div>
      {result?.error && <p className="text-sm text-destructive">{result.error}</p>}
      {result && !result.error && (
        <div className="flex w-full max-w-2xl flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            {result.title} — {result.sourceURL} (HTTP {result.statusCode})
          </p>
          <pre className="whitespace-pre-wrap rounded border p-4 text-sm">{result.markdown}</pre>
        </div>
      )}
    </main>
  );
}
