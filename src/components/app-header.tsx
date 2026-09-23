"use client";

import { UserButton } from "@clerk/nextjs";

export function AppHeader() {
  return (
    <header className="flex items-center justify-end gap-4 p-4">
      <UserButton />
    </header>
  );
}
