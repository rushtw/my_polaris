"use client";

import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/mode-toggle";

export function AppHeader() {
  return (
    <header className="flex items-center justify-end gap-4 p-4">
      <ModeToggle />
      <UserButton />
    </header>
  );
}
