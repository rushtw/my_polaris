"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";

import { useProjectsPartial } from "../hooks/use-projects";

interface ProjectsListProps {
  onViewAll: () => void; // opens the Ctrl K search dialog
}

// e.g. "2 minutes ago"
const timeAgo = (timestamp: number) =>
  formatDistanceToNow(new Date(timestamp), { addSuffix: true });

export const ProjectsList = ({ onViewAll }: ProjectsListProps) => {
  // The 6 most recently updated projects (sorted by the by_owner index)
  const projects = useProjectsPartial(6);

  if (projects === undefined) return <Spinner className="size-4 text-ring" />; // still loading
  if (projects.length === 0) return null; // no projects yet

  const [mostRecent, ...rest] = projects;

  return (
    <div className="flex flex-col gap-4">
      {/* Most recently updated */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">Last updated</span>
        <Link
          href={`/projects/${mostRecent._id}`}
          className="flex flex-col gap-1 border bg-background p-4 hover:bg-accent"
        >
          <span className="font-medium truncate">{mostRecent.name}</span>
          <span className="text-xs text-muted-foreground">{timeAgo(mostRecent.updatedAt)}</span>
        </Link>
      </div>

      {/* The rest */}
      {rest.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Recent projects</span>
            <button
              onClick={onViewAll}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>View all</span>
              <Kbd className="bg-accent border">Ctrl K</Kbd>
            </button>
          </div>
          <ul className="flex flex-col">
            {rest.map((project) => (
              <li key={project._id}>
                <Link
                  href={`/projects/${project._id}`}
                  className="flex items-center justify-between gap-2 py-1 text-sm text-foreground/60 hover:text-foreground"
                >
                  <span className="truncate">{project.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {timeAgo(project.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
