import { useState } from "react";
import { ChevronRightIcon } from "lucide-react";
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils";

import { cn } from "@/lib/utils";

import { getItemPadding } from "./constants";

// The inline input that replaces a row while renaming it.
// Enter or clicking away → save (an empty name keeps the old one); Escape → cancel.
export const RenameInput = ({
  type,
  defaultValue,
  isOpen,
  level,
  onSubmit,
  onCancel,
}: {
  type: "file" | "folder";
  defaultValue: string;
  isOpen?: boolean;
  level: number;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = () => {
    onSubmit(value.trim() || defaultValue);
  };

  return (
    <div
      className="w-full flex items-center gap-1 h-5.5 bg-accent/30"
      style={{ paddingLeft: getItemPadding(level, type === "file") }}
    >
      <div className="flex items-center gap-0.5">
        {type === "folder" && (
          <ChevronRightIcon
            className={cn("size-4 shrink-0 text-muted-foreground", isOpen && "rotate-90")}
          />
        )}
        {type === "file" && <FileIcon fileName={value} autoAssign className="size-4" />}
        {type === "folder" && <FolderIcon folderName={value} className="size-4" />}
      </div>
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 bg-transparent text-sm outline-none focus:ring-1 focus:ring-inset focus:ring-ring"
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") onCancel();
        }}
        onFocus={(e) => {
          // Files: select only the name before the extension ("page" in "page.tsx"),
          // so typing a new name keeps the extension. Folders: select everything.
          const lastDotIndex = e.currentTarget.value.lastIndexOf(".");
          if (type === "file" && lastDotIndex > 0) {
            e.currentTarget.setSelectionRange(0, lastDotIndex);
          } else {
            e.currentTarget.select();
          }
        }}
      />
    </div>
  );
};
