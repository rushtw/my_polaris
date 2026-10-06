"use client";

import type { FC } from "react";
import { CodeIcon } from "lucide-react";

import { PanelPlaceholder } from "@/components/panel-placeholder";

// Placeholder: the code editor with tabs for open files (Chapter 10)
// projectId is passed in already; the real EditorView (later chapter) uses it
export const EditorView: FC<{ projectId: string }> = () => {
  return (
    <PanelPlaceholder
      icon={CodeIcon}
      title="Code editor"
      description="Open a file from the explorer to edit it here."
      chapter="Chapter 10"
    />
  );
};
