import { useMutation, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";

// All of the user's projects, most recently updated first
export const useProjects = () => {
  return useQuery(api.projects.get);
};

// One project by ID (from the URL): the project, null if not found, undefined while loading
export const useProject = (projectId: string) => {
  return useQuery(api.projects.getById, { id: projectId });
};

// The `limit` most recently updated projects
export const useProjectsPartial = (limit: number) => {
  return useQuery(api.projects.getPartial, { limit });
};

export const useCreateProject = () => {
  return useMutation(api.projects.create);
};
