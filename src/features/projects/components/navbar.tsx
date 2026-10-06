"use client";

import Link from "next/link";
import { useState } from "react";
import { Poppins } from "next/font/google";
import { CloudCheckIcon, LoaderIcon } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";

import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { Doc } from "../../../../convex/_generated/dataModel";
import { useRenameProject } from "../hooks/use-projects";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// The IDE's top bar: My_Polaris / project name (click to rename) · saved status · theme · avatar
export const Navbar = ({ project }: { project: Doc<"projects"> | undefined }) => {
  const renameProject = useRenameProject();
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState("");

  const handleStartRename = () => {
    if (!project) return;
    setName(project.name);
    setIsRenaming(true);
  };

  const handleSubmit = () => {
    if (!project) return;
    setIsRenaming(false);

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName === project.name) return; // nothing to save

    renameProject({ id: project._id, name: trimmedName });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
    else if (e.key === "Escape") setIsRenaming(false); // cancel
  };

  return (
    // Radix tooltips need a TooltipProvider above them
    <TooltipProvider>
      <nav className="flex justify-between items-center gap-x-2 p-2 bg-sidebar border-b">
        <div className="flex items-center gap-x-2">
          <Breadcrumb>
            <BreadcrumbList className="gap-0!">
              <BreadcrumbItem>
                <BreadcrumbLink className="flex items-center gap-1.5" asChild>
                  <Button variant="ghost" className="w-fit! p-1.5! h-7!" asChild>
                    <Link href="/">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/logo.svg" alt="My_Polaris" className="size-5" />
                      <span className={cn("text-sm font-medium", font.className)}>My_Polaris</span>
                    </Link>
                  </Button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="ml-0! mr-1" />
              <BreadcrumbItem>
                {isRenaming ? (
                  <input
                    autoFocus
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={(e) => e.currentTarget.select()} // select all, ready to retype
                    onBlur={handleSubmit} // clicking away saves
                    onKeyDown={handleKeyDown}
                    className="text-sm bg-transparent text-foreground outline-none focus:ring-1 focus:ring-inset focus:ring-ring font-medium max-w-40 truncate"
                  />
                ) : (
                  <BreadcrumbPage
                    onClick={handleStartRename}
                    title="Click to rename"
                    className="text-sm cursor-pointer hover:text-primary font-medium max-w-40 truncate"
                  >
                    {project?.name ?? "Loading..."}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Status: spinner while importing (Phase 2), otherwise "Saved … ago" */}
          {project?.importStatus === "importing" ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <LoaderIcon className="size-4 text-muted-foreground animate-spin" />
              </TooltipTrigger>
              <TooltipContent>Importing...</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <CloudCheckIcon className="size-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                Saved{" "}
                {project?.updatedAt
                  ? formatDistanceToNow(project.updatedAt, { addSuffix: true })
                  : "Loading..."}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserButton />
        </div>
      </nav>
    </TooltipProvider>
  );
};
