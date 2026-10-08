"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronRightIcon, CopyMinusIcon, FilePlusCornerIcon, FolderPlusIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/convex-error";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useProject } from "../../hooks/use-projects";
import { useCreateFile, useCreateFolder, useFolderContents } from "../../hooks/use-files";
import { CreateInput } from "./create-input";
import { LoadingRow } from "./loading-row";
import { Tree } from "./tree";
import type { Id } from "../../../../../convex/_generated/dataModel";

// The project's file tree: a header row, then the root files and folders
export const FileExplorer = ({ projectId: projectIdParam }: { projectId: string }) => {
  // The layout already confirmed this project exists, so the URL string is a real project ID
  const projectId = projectIdParam as Id<"projects">;

  const [isOpen, setIsOpen] = useState(true);
  const [collapseKey, setCollapseKey] = useState(0);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);
  const [selectedId, setSelectedId] = useState<Id<"files"> | null>(null);

  const project = useProject(projectId);
  const rootFiles = useFolderContents({ projectId, enabled: isOpen }); // no parentId = root

  const createFile = useCreateFile();
  const createFolder = useCreateFolder();

  const handleCreate = (name: string) => {
    const type = creating;
    setCreating(null);
    const promise =
      type === "file"
        ? createFile({ projectId, name, content: "", parentId: undefined })
        : createFolder({ projectId, name, parentId: undefined });
    promise.catch((error) => toast.error(getErrorMessage(error)));
  };

  // Header buttons sit inside the clickable header, so stop the click from also
  // toggling the tree open/closed
  const headerAction = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    action();
  };

  return (
    <div className="h-full bg-sidebar">
      <ScrollArea className="h-full">
        {/* Header: project name + hover buttons */}
        <div
          role="button"
          onClick={() => setIsOpen((value) => !value)}
          className="group/project cursor-pointer w-full text-left flex items-center gap-0.5 h-5.5 bg-accent font-bold"
        >
          <ChevronRightIcon
            className={cn("size-4 shrink-0 text-muted-foreground", isOpen && "rotate-90")}
          />
          <p className="text-xs uppercase line-clamp-1">{project?.name ?? "Loading..."}</p>
          <div className="opacity-0 group-hover/project:opacity-100 transition-none duration-0 flex items-center gap-0.5 ml-auto">
            <Button
              title="New File"
              variant="highlight"
              size="icon-xs"
              onClick={headerAction(() => {
                setIsOpen(true);
                setCreating("file");
              })}
            >
              <FilePlusCornerIcon className="size-3.5" />
            </Button>
            <Button
              title="New Folder"
              variant="highlight"
              size="icon-xs"
              onClick={headerAction(() => {
                setIsOpen(true);
                setCreating("folder");
              })}
            >
              <FolderPlusIcon className="size-3.5" />
            </Button>
            <Button
              title="Collapse Folders"
              variant="highlight"
              size="icon-xs"
              // A new key re-creates every <Tree> below, so all folders start closed again
              onClick={headerAction(() => setCollapseKey((prev) => prev + 1))}
            >
              <CopyMinusIcon className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Root files and folders */}
        {isOpen && (
          <>
            {rootFiles === undefined && <LoadingRow level={0} />}
            {creating && (
              <CreateInput
                type={creating}
                level={0}
                onSubmit={handleCreate}
                onCancel={() => setCreating(null)}
              />
            )}
            {rootFiles?.map((item) => (
              <Tree
                key={`${item._id}-${collapseKey}`}
                item={item}
                level={0}
                projectId={projectId}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            ))}
            {rootFiles?.length === 0 && !creating && (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No files yet. Hover the header to add one.
              </p>
            )}
          </>
        )}
      </ScrollArea>
    </div>
  );
};
