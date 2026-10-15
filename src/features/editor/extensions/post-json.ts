// A small fetch helper for the AI routes (what Polaris uses `ky` for):
// POST JSON, give up after `timeoutMs`, and throw on a non-2xx answer.
// Aborting `signal` (a newer request, or Cancel) rejects with an "AbortError".
export const postJson = async (
  url: string,
  body: unknown,
  { signal, timeoutMs }: { signal: AbortSignal; timeoutMs: number },
): Promise<unknown> => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    // Whichever comes first: the caller's abort, or the timeout ("TimeoutError")
    signal: AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]),
  });

  if (!response.ok) {
    throw new Error(`${url} answered ${response.status}`);
  }
  return response.json();
};

export const isAbortError = (error: unknown) =>
  error instanceof Error && error.name === "AbortError";
