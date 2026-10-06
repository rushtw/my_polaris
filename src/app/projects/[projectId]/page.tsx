import { ProjectIdView } from "@/features/projects/components/project-id-view";

// [projectId] in the folder name makes this a dynamic route: /projects/<anything>.
// In Next.js 16, params arrives as a Promise, so the page is async and awaits it.
const ProjectIdPage = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;

  return <ProjectIdView projectId={projectId} />;
};

export default ProjectIdPage;
