import { z } from "zod";
import { toast } from "sonner";

import { isAbortError, postJson } from "../post-json";

const suggestionRequestSchema = z.object({
  fileName: z.string(),
  code: z.string(),
  currentLine: z.string(),
  previousLines: z.string(),
  textBeforeCursor: z.string(),
  textAfterCursor: z.string(),
  nextLines: z.string(),
  lineNumber: z.number(),
});

const suggestionResponseSchema = z.object({
  suggestion: z.string(),
});

export type SuggestionRequest = z.infer<typeof suggestionRequestSchema>;

// Returns the suggestion, or null when there's none (empty answer, aborted, or an error)
export const fetcher = async (
  payload: SuggestionRequest,
  signal: AbortSignal,
): Promise<string | null> => {
  try {
    const response = await postJson("/api/suggestion", suggestionRequestSchema.parse(payload), {
      signal,
      timeoutMs: 10_000,
    });
    return suggestionResponseSchema.parse(response).suggestion || null;
  } catch (error) {
    // Aborted because the user kept typing: not an error
    if (isAbortError(error)) return null;
    toast.error("Failed to fetch AI completion");
    return null;
  }
};
