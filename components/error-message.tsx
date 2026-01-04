import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  message: string;
  className?: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, className, onRetry }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "bg-destructive/15 text-destructive p-4 rounded-md flex items-start gap-3",
        className
      )}
    >
      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm underline mt-2 hover:no-underline"
          >
            Intentar de nuevo
          </button>
        )}
      </div>
    </div>
  );
}

