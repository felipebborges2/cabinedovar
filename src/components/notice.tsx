import { cn } from "@/lib/utils";

export function Notice({
  message,
  kind = "error",
}: {
  message?: string;
  kind?: "error" | "success";
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={cn(
        "mb-4 rounded-md border px-4 py-3 text-sm",
        kind === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-primary/30 bg-primary/10 text-primary",
      )}
    >
      {message}
    </div>
  );
}
