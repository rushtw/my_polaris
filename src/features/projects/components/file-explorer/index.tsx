"use client";

import type { FC } from "react";
import { FolderTreeIcon } from "lucide-react";

import { PanelPlaceholder } from "@/components/panel-placeholder";

// Placeholder: the project's file tree (Chapter 9)
// projectId is passed in already; the real FileExplorer (later chapter) uses it
export const FileExplorer: FC<{ projectId: string }> = () => {
  return (
    <PanelPlaceholder
      icon={FolderTreeIcon}
      title="File explorer"
      description="The project's files and folders: create, rename and delete."
      chapter="Chapter 9"
    />
  );
};
