import { ProjectIdLayout } from "@/features/projects/components/project-id-layout";

// A layout wraps every page under /projects/[projectId] and stays mounted when
// moving between them. Like the page, it gets params as a Promise (Next.js 16).
const ProjectLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;

  return <ProjectIdLayout projectId={projectId}>{children}</ProjectIdLayout>;
};

export default ProjectLayout;
