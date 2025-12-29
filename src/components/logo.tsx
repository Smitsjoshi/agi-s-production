import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className="relative inline-flex items-center justify-center rounded-lg px-3 py-1.5 overflow-hidden font-headline font-bold bg-primary text-primary-foreground"
      >
        <span className="relative z-10 text-lg tracking-wider">AGI-S</span>
      </div>
    </div>
  );
}
