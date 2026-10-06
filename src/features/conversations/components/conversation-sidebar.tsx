"use client";

import type { FC } from "react";
import { MessageSquareIcon } from "lucide-react";

import { PanelPlaceholder } from "@/components/panel-placeholder";

// Placeholder: the AI chat for this project (Chapters 12–13)
// projectId is passed in already; the real ConversationSidebar (later chapter) uses it
export const ConversationSidebar: FC<{ projectId: string }> = () => {
  return (
    <PanelPlaceholder
      icon={MessageSquareIcon}
      title="AI chat"
      description="Ask the AI to build and change this project."
      chapter="Chapters 12–13"
    />
  );
};
