import type { LucideIcon } from "lucide-react";

interface PanelPlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  chapter: string; // which chapter replaces this placeholder
}

// Temporary content for an IDE pane that a later chapter fills in
export const PanelPlaceholder = ({
  icon: Icon,
  title,
  description,
  chapter,
}: PanelPlaceholderProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 p-6 text-center bg-sidebar">
      <Icon className="size-6 text-muted-foreground" />
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-60 text-xs text-muted-foreground">{description}</p>
      <p className="text-xs text-muted-foreground/70">Coming in {chapter}</p>
    </div>
  );
};
