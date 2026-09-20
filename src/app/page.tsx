"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const { isAuthenticated } = useConvexAuth();
  const projects = useQuery(api.projects.get1, isAuthenticated ? {} : "skip");
  const createProject = useMutation(api.projects.create1);
  const [newProjectName, setNewProjectName] = useState("");

  const handleCreate = async () => {
    const name = newProjectName.trim();
    if (!name) return;
    await createProject({ name });
    setNewProjectName("");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      

      <div className="flex w-full max-w-sm gap-2">
        <Input
          placeholder="Project name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
        />
        <Button onClick={handleCreate} disabled={!newProjectName.trim()}>
          Create Project
        </Button>
      </div>

      {projects?.map(({ _id, ownerId, name }) => (
        <div className="border border-yellow-300 rounded-md p-4 mb-2" key={_id.toString()}>
          {name} ({ownerId})
        </div>
      ))}
    </main>
  );
}
