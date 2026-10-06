"use client";

import type { FC } from "react";
import { MonitorPlayIcon } from "lucide-react";

import { PanelPlaceholder } from "@/components/panel-placeholder";

// Placeholder: the running app + terminal, powered by WebContainer (Chapter 14)
// projectId is passed in already; the real PreviewView (later chapter) uses it
export const PreviewView: FC<{ projectId: string }> = () => {
  return (
    <PanelPlaceholder
      icon={MonitorPlayIcon}
      title="Preview"
      description="The project running live in the browser, with a terminal."
      chapter="Chapter 14"
    />
  );
};
