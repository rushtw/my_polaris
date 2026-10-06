"use client";

import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/mode-toggle";

// Shown on the landing page only, floating in the top-right corner so it doesn't
// add to the page height. The project IDE has its own Navbar with these controls.
export function AppHeader() {
  return (
    <header className="absolute top-0 right-0 flex items-center justify-end gap-4 p-4">
      <ModeToggle />
      <UserButton />
    </header>
  );
}
