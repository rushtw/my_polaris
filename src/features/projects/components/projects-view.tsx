"use client";

import { useEffect, useState } from "react";
import { Poppins } from "next/font/google";
import { SparkleIcon } from "lucide-react";
import { FaGithub } from "react-icons/fa";

import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

import { ProjectsList } from "./projects-list";
import { ProjectsCommandDialog } from "./projects-command-dialog";
import { NewProjectDialog } from "./new-project-dialog";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const ProjectsView = () => {
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);

  // Keyboard shortcuts: Ctrl J = New, Ctrl K = Search (Ctrl I is added with Import in Phase 2)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) { // Ctrl on Windows (⌘ on Mac also works)
        if (e.key === "j") {
          e.preventDefault(); // stop the browser's own Ctrl J (Downloads)
          setNewProjectDialogOpen(true);
        }
        if (e.key === "k") {
          e.preventDefault(); // stop the browser's own Ctrl K (address bar search)
          setCommandDialogOpen(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Cleanup: remove the listener when leaving the page
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <ProjectsCommandDialog
        open={commandDialogOpen}
        onOpenChange={setCommandDialogOpen}
      />
      <NewProjectDialog
        open={newProjectDialogOpen}
        onOpenChange={setNewProjectDialogOpen}
      />
      <div className="relative min-h-screen bg-sidebar flex flex-col items-center justify-center p-6 md:p-16">
        <AppHeader />
        <div className="w-full max-w-sm mx-auto flex flex-col gap-4 items-center">

          {/* Logo + title */}
          <div className="flex items-center gap-2 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="My_Polaris" className="size-[32px] md:size-[46px]" />
            <h1 className={cn("text-4xl md:text-5xl font-semibold", font.className)}>
              My_Polaris
            </h1>
          </div>

          <div className="flex flex-col gap-4 w-full">
            {/* New + Import buttons (Import is Phase 2) */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => setNewProjectDialogOpen(true)}
                className="h-full items-start justify-start p-4 bg-background border flex flex-col gap-6 rounded-none"
              >
                <div className="flex items-center justify-between w-full">
                  <SparkleIcon className="size-4" />
                  <Kbd className="bg-accent border">Ctrl J</Kbd>
                </div>
                <span className="text-sm">New</span>
              </Button>
              <Button
                variant="outline"
                className="h-full items-start justify-start p-4 bg-background border flex flex-col gap-6 rounded-none"
              >
                <div className="flex items-center justify-between w-full">
                  <FaGithub className="size-4" />
                  <Kbd className="bg-accent border">Ctrl I</Kbd>
                </div>
                <span className="text-sm">Import</span>
              </Button>
            </div>

            <ProjectsList onViewAll={() => setCommandDialogOpen(true)} />
          </div>

        </div>
      </div>
    </>
  );
};
