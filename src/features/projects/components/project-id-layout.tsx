"use client";

import Link from "next/link";
import { Allotment } from "allotment";
import { ArrowLeftIcon } from "lucide-react";

import { ConversationSidebar } from "@/features/conversations/components/conversation-sidebar";

import { Navbar } from "./navbar";
import { useProject } from "../hooks/use-projects";

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 800;
const DEFAULT_CONVERSATION_SIDEBAR_WIDTH = 400;
const DEFAULT_MAIN_SIZE = 1000;

// getById returns null for a bad ID, a missing project, or someone else's project
const ProjectNotFound = () => (
  <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center gap-3 p-6">
    <h1 className="text-2xl font-semibold">Project not found</h1>
    <p className="text-sm text-muted-foreground">It may have been deleted, or the link is wrong.</p>
    <Link
      href="/"
      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeftIcon className="size-4" />
      All projects
    </Link>
  </div>
);

// The IDE frame around every page under /projects/[projectId]:
// Navbar on top, then a resizable split: AI chat sidebar | page content
export const ProjectIdLayout = ({
  children,
  projectId,
}: {
  children: React.ReactNode;
  projectId: string;
}) => {
  const project = useProject(projectId); // undefined while loading, null if not found

  if (project === null) return <ProjectNotFound />;

  return (
    <div className="w-full h-screen flex flex-col">
      <Navbar project={project} />
      <div className="flex-1 flex overflow-hidden">
        <Allotment className="flex-1" defaultSizes={[DEFAULT_CONVERSATION_SIDEBAR_WIDTH, DEFAULT_MAIN_SIZE]}>
          <Allotment.Pane
            snap // drag it below minSize and it collapses
            minSize={MIN_SIDEBAR_WIDTH}
            maxSize={MAX_SIDEBAR_WIDTH}
            preferredSize={DEFAULT_CONVERSATION_SIDEBAR_WIDTH}
          >
            <ConversationSidebar projectId={projectId} />
          </Allotment.Pane>
          <Allotment.Pane>{children}</Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
};
