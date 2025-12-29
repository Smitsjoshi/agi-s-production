import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <div className="font-headline font-bold text-xl tracking-tight text-foreground">
        AGI-S
      </div>
    </div>
  );
}
