"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InngestDemoPage() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const res = await fetch("/api/demo/inngest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setStatus(`Queued — event ${data.eventId}. Check the Inngest dashboard (localhost:8288) to watch it run.`);
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="flex w-full max-w-sm gap-2">
        <Input
          placeholder="Type a prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button onClick={handleClick} disabled={loading || !prompt.trim()}>
          {loading ? "Queuing..." : "Generate"}
        </Button>
      </div>
      {status && <p className="max-w-2xl text-sm text-muted-foreground">{status}</p>}
    </main>
  );
}
