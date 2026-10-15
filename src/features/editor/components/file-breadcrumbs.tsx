"use client";

import { Fragment } from "react";
import { FileIcon } from "@react-symbols/icons/utils";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useFilePath } from "@/features/projects/hooks/use-files";

import { useEditor } from "../hooks/use-editor";
import type { Id } from "../../../../convex/_generated/dataModel";

// The active file's path: src › app › page.tsx
export const FileBreadcrumbs = ({ projectId }: { projectId: Id<"projects"> }) => {
  const { activeTabId } = useEditor(projectId);
  const filePath = useFilePath(activeTabId); // undefined = loading, null = file deleted

  return (
    <div className="p-2 bg-background pl-4 border-b">
      <Breadcrumb>
        <BreadcrumbList className="sm:gap-0.5 gap-0.5">
          {!filePath ? (
            <BreadcrumbItem className="text-sm">
              <BreadcrumbPage>&nbsp;</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            filePath.map((item, index) => {
              const isLast = index === filePath.length - 1;
              return (
                <Fragment key={item._id}>
                  <BreadcrumbItem className="text-sm">
                    {isLast ? (
                      <BreadcrumbPage className="flex items-center gap-1">
                        <FileIcon fileName={item.name} autoAssign className="size-4" />
                        {item.name}
                      </BreadcrumbPage>
                    ) : (
                      <span className="text-muted-foreground">{item.name}</span>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </Fragment>
              );
            })
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
