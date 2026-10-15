"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { AlertTriangleIcon, FileXIcon } from "lucide-react";

import { useFile, useUpdateFile } from "@/features/projects/hooks/use-files";

import { CodeEditor } from "./code-editor";
import { TopNavigation } from "./top-navigation";
import { FileBreadcrumbs } from "./file-breadcrumbs";
import { useEditor } from "../hooks/use-editor";
import type { Id } from "../../../../convex/_generated/dataModel";

const DEBOUNCE_MS = 1500; // save 1.5 s after the last key press

// The Code tab's right pane: tabs, breadcrumbs, and the editor for the active file
export const EditorView = ({ projectId: projectIdParam }: { projectId: string }) => {
  // The layout already confirmed this project exists
  const projectId = projectIdParam as Id<"projects">;

  const { activeTabId } = useEditor(projectId);
  const activeFile = useFile(activeTabId); // undefined = loading/none, null = deleted
  const updateFile = useUpdateFile();

  // The unsaved change (if any) and its timer
  const pendingRef = useRef<{ id: Id<"files">; content: string } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save the pending change NOW (if there is one)
  const flush = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;

    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending) {
      updateFile(pending).catch(() => toast.error("Could not save the file"));
    }
  }, [updateFile]);

  // When the active file changes (or the editor closes), save immediately instead of
  // dropping the pending change. (Polaris clears the timer here, losing the last edit.)
  useEffect(() => {
    return () => flush();
  }, [activeTabId, flush]);

  const handleChange = (fileId: Id<"files">, content: string) => {
    pendingRef.current = { id: fileId, content };
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(flush, DEBOUNCE_MS); // debounce: restart on every key
  };

  const isBinary = activeFile && activeFile.storageId;
  const isText = activeFile && !activeFile.storageId;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center">
        <TopNavigation projectId={projectId} />
      </div>
      {activeTabId && <FileBreadcrumbs projectId={projectId} />}
      <div className="flex-1 min-h-0 bg-background">
        {/* No file open */}
        {!activeTabId && (
          <div className="size-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" className="size-12 opacity-25" />
          </div>
        )}
        {/* The open file was deleted (e.g. its folder was deleted) */}
        {activeTabId && activeFile === null && (
          <div className="size-full flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <FileXIcon className="size-8" />
            This file no longer exists.
          </div>
        )}
        {isText && (
          <CodeEditor
            key={activeFile._id} // a new CodeMirror for each file
            fileName={activeFile.name}
            initialValue={activeFile.content}
            onChange={(content) => handleChange(activeFile._id, content)}
          />
        )}
        {isBinary && (
          <div className="size-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2.5 max-w-md text-center">
              <AlertTriangleIcon className="size-10 text-yellow-500" />
              <p className="text-sm">
                The file is not displayed in the text editor because it is either binary or uses an
                unsupported text encoding.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
