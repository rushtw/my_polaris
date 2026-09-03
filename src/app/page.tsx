import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 flex w-full max-w-5xl items-center justify-between font-mono text-sm">
        <Button variant="destructive">Click me</Button>
        <ModeToggle />
      </div>
    </main>
  );
}
