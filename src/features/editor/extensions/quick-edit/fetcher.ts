import { z } from "zod";
import { toast } from "sonner";

import { isAbortError, postJson } from "../post-json";

const editRequestSchema = z.object({
  selectedCode: z.string(),
  fullCode: z.string(),
  instruction: z.string(),
});

const editResponseSchema = z.object({
  editedCode: z.string(),
});

type EditRequest = z.infer<typeof editRequestSchema>;

// Returns the edited code, or null (empty answer, Cancel pressed, or an error)
export const fetcher = async (
  payload: EditRequest,
  signal: AbortSignal,
): Promise<string | null> => {
  try {
    const response = await postJson("/api/quick-edit", editRequestSchema.parse(payload), {
      signal,
      timeoutMs: 30_000, // longer: it may scrape URLs first
    });
    return editResponseSchema.parse(response).editedCode || null;
  } catch (error) {
    // Cancel pressed: not an error
    if (isAbortError(error)) return null;
    toast.error("Failed to fetch AI quick edit");
    return null;
  }
};
