"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Spinner } from "@/components/ui/spinner";

import { useProject } from "../hooks/use-projects";

const BackLink = () => (
  <Link
    href="/"
    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
  >
    <ArrowLeftIcon className="size-3" />
    All projects
  </Link>
);

// Placeholder for the project page: the editor, file tree and AI chat come in later chapters
export const ProjectIdView = ({ projectId }: { projectId: string }) => {
  const project = useProject(projectId);

  return (
    <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center p-6 md:p-16">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
        <BackLink />

        {project === undefined && <Spinner className="size-4 text-ring" />}

        {project === null && (
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Project not found</h1>
            <p className="text-sm text-muted-foreground">
              It may have been deleted, or the link is wrong.
            </p>
          </div>
        )}

        {project && (
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold truncate">{project.name}</h1>
            <p className="text-xs text-muted-foreground">
              Last updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              The editor comes in a later chapter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
