"use client";

import { XIcon } from "lucide-react";
import { FileIcon } from "@react-symbols/icons/utils";

import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useFile } from "@/features/projects/hooks/use-files";

import { useEditor } from "../hooks/use-editor";
import type { Id } from "../../../../convex/_generated/dataModel";

const Tab = ({
  fileId,
  isFirst,
  projectId,
}: {
  fileId: Id<"files">;
  isFirst: boolean;
  projectId: Id<"projects">;
}) => {
  const file = useFile(fileId); // each tab loads its own file name
  const { activeTabId, previewTabId, setActiveTab, openFile, closeTab } = useEditor(projectId);

  const isActive = activeTabId === fileId;
  const isPreview = previewTabId === fileId;
  const fileName = file === undefined ? "Loading..." : file === null ? "(deleted)" : file.name;

  return (
    <div
      onClick={() => setActiveTab(fileId)}
      onDoubleClick={() => openFile(fileId, { pinned: true })} // pins a preview tab
      className={cn(
        "flex items-center gap-2 h-8.75 pl-2 pr-1.5 cursor-pointer text-muted-foreground group border-y border-x border-transparent hover:bg-accent/30",
        isActive && "bg-background text-foreground border-x-border border-b-background -mb-px drop-shadow",
        isFirst && "border-l-transparent!",
      )}
    >
      {file === undefined ? (
        <Spinner className="text-ring" />
      ) : (
        <FileIcon fileName={file?.name ?? ""} autoAssign className="size-4" />
      )}
      <span className={cn("text-sm whitespace-nowrap", isPreview && "italic")}>{fileName}</span>
      <button
        title="Close"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation(); // don't also activate the tab
          closeTab(fileId);
        }}
        className={cn(
          "p-0.5 rounded-sm hover:bg-white/10 opacity-0 group-hover:opacity-100",
          isActive && "opacity-100",
        )}
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
};

// The tab bar: one tab per open file, scrolling sideways when there are many
export const TopNavigation = ({ projectId }: { projectId: Id<"projects"> }) => {
  const { openTabs } = useEditor(projectId);

  return (
    <ScrollArea className="flex-1">
      <nav className="bg-sidebar flex items-center h-8.75 border-b">
        {openTabs.map((fileId, index) => (
          <Tab key={fileId} fileId={fileId} isFirst={index === 0} projectId={projectId} />
        ))}
      </nav>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
