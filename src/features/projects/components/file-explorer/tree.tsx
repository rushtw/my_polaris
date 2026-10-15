import { useState } from "react";
import { toast } from "sonner";
import { ChevronRightIcon } from "lucide-react";
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils";

import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/convex-error";
import {
  useCreateFile,
  useCreateFolder,
  useDeleteFile,
  useFolderContents,
  useRenameFile,
} from "@/features/projects/hooks/use-files";
import { useEditor } from "@/features/editor/hooks/use-editor";

import { LoadingRow } from "./loading-row";
import { CreateInput } from "./create-input";
import { RenameInput } from "./rename-input";
import { TreeItemWrapper } from "./tree-item-wrapper";
import type { Doc, Id } from "../../../../../convex/_generated/dataModel";

// Show a toast if a Convex call fails (e.g. "A file named … already exists here")
const reportErrors = (promise: Promise<unknown>) => {
  promise.catch((error) => toast.error(getErrorMessage(error)));
};

// One file or folder. A folder renders its own children as more <Tree>s
// (recursion), one level deeper each time.
export const Tree = ({
  item,
  level = 0,
  projectId,
}: {
  item: Doc<"files">;
  level?: number;
  projectId: Id<"projects">;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);

  const renameFile = useRenameFile();
  const deleteFile = useDeleteFile();
  const createFile = useCreateFile();
  const createFolder = useCreateFolder();

  // The editor's tabs (zustand store): open files, and which one is active
  const { openFile, closeTab, activeTabId } = useEditor(projectId);

  // A folder's children are only loaded while it's open ("skip" otherwise)
  const folderContents = useFolderContents({
    projectId,
    parentId: item._id,
    enabled: item.type === "folder" && isOpen,
  });

  const handleRename = (newName: string) => {
    setIsRenaming(false);
    if (newName === item.name) return;
    reportErrors(renameFile({ id: item._id, newName }));
  };

  const handleDelete = () => {
    if (item.type === "file") closeTab(item._id); // close its editor tab first
    reportErrors(deleteFile({ id: item._id }));
  };

  const handleCreate = (name: string) => {
    const type = creating;
    setCreating(null);
    if (type === "file") {
      reportErrors(createFile({ projectId, parentId: item._id, name, content: "" }));
    } else {
      reportErrors(createFolder({ projectId, parentId: item._id, name }));
    }
  };

  const startCreating = (type: "file" | "folder") => {
    setIsOpen(true); // open the folder so the input appears inside it
    setCreating(type);
  };

  // ── A file: one row ──────────────────────────────────────────────
  if (item.type === "file") {
    if (isRenaming) {
      return (
        <RenameInput
          type="file"
          defaultValue={item.name}
          level={level}
          onSubmit={handleRename}
          onCancel={() => setIsRenaming(false)}
        />
      );
    }

    return (
      <TreeItemWrapper
        item={item}
        level={level}
        isActive={activeTabId === item._id}
        onClick={() => openFile(item._id, { pinned: false })} // preview tab (italic)
        onDoubleClick={() => openFile(item._id, { pinned: true })} // pinned tab
        onRename={() => setIsRenaming(true)}
        onDelete={handleDelete}
      >
        <FileIcon fileName={item.name} autoAssign className="size-4" />
        <span className="truncate text-sm">{item.name}</span>
      </TreeItemWrapper>
    );
  }

  // ── A folder: its row, then (when open) its contents ────────────
  const folderRow = isRenaming ? (
    <RenameInput
      type="folder"
      defaultValue={item.name}
      isOpen={isOpen}
      level={level}
      onSubmit={handleRename}
      onCancel={() => setIsRenaming(false)}
    />
  ) : (
    <TreeItemWrapper
      item={item}
      level={level}
      onClick={() => setIsOpen((value) => !value)}
      onRename={() => setIsRenaming(true)}
      onDelete={handleDelete}
      onCreateFile={() => startCreating("file")}
      onCreateFolder={() => startCreating("folder")}
    >
      <div className="flex items-center gap-0.5">
        <ChevronRightIcon
          className={cn("size-4 shrink-0 text-muted-foreground", isOpen && "rotate-90")}
        />
        <FolderIcon folderName={item.name} className="size-4" />
      </div>
      <span className="truncate text-sm">{item.name}</span>
    </TreeItemWrapper>
  );

  return (
    <>
      {folderRow}
      {isOpen && (
        <>
          {folderContents === undefined && <LoadingRow level={level + 1} />}
          {creating && (
            <CreateInput
              type={creating}
              level={level + 1}
              onSubmit={handleCreate}
              onCancel={() => setCreating(null)}
            />
          )}
          {folderContents?.map((subItem) => (
            <Tree
              key={subItem._id}
              item={subItem}
              level={level + 1}
              projectId={projectId}
            />
          ))}
        </>
      )}
    </>
  );
};
