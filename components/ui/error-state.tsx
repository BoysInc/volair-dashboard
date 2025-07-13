import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  showGoHome?: boolean;
  onGoHome?: () => void;
  showGoBack?: boolean;
  onGoBack?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading the data.",
  error,
  size = "md",
  className,
  showRetry = true,
  onRetry,
  showGoHome = false,
  onGoHome,
  showGoBack = false,
  onGoBack,
}: ErrorStateProps) {
  const sizeClasses = {
    sm: "h-32",
    md: "h-48",
    lg: "h-64",
  };

  const iconSizes = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const titleSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const messageSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-4 p-8 text-center",
        sizeClasses[size],
        className
      )}
    >
      {/* Error Icon */}
      <div
        className={cn(
          "rounded-full bg-destructive/10 p-4",
          size === "sm" && "p-2",
          size === "lg" && "p-6"
        )}
      >
        <AlertCircle className={cn("text-destructive", iconSizes[size])} />
      </div>

      {/* Title */}
      <h3 className={cn("font-semibold text-foreground", titleSizes[size])}>
        {title}
      </h3>

      {/* Message */}
      <p className={cn("text-muted-foreground max-w-md", messageSizes[size])}>
        {message}
      </p>

      {/* Error Details (if provided) */}
      {error && (
        <details className="mt-4 w-full max-w-md">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            Error details
          </summary>
          <div className="mt-2 p-3 bg-muted rounded-md text-left">
            <code className="text-xs text-muted-foreground break-all">
              {error}
            </code>
          </div>
        </details>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mt-6">
        {showRetry && onRetry && (
          <Button
            onClick={onRetry}
            variant="default"
            size={size === "sm" ? "sm" : "default"}
            className="min-w-[120px]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}

        {showGoHome && onGoHome && (
          <Button
            onClick={onGoHome}
            variant="outline"
            size={size === "sm" ? "sm" : "default"}
            className="min-w-[120px]"
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        )}

        {showGoBack && onGoBack && (
          <Button
            onClick={onGoBack}
            variant="outline"
            size={size === "sm" ? "sm" : "default"}
            className="min-w-[120px]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        )}
      </div>
    </div>
  );
}

// Specialized error states for common scenarios
export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Network Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      showRetry={true}
      onRetry={onRetry}
    />
  );
}

export function NotFoundErrorState({ onGoHome }: { onGoHome?: () => void }) {
  return (
    <ErrorState
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      showGoHome={true}
      onGoHome={onGoHome}
      showRetry={false}
    />
  );
}

export function UnauthorizedErrorState({
  onGoHome,
}: {
  onGoHome?: () => void;
}) {
  return (
    <ErrorState
      title="Access Denied"
      message="You don't have permission to access this resource."
      showGoHome={true}
      onGoHome={onGoHome}
      showRetry={false}
    />
  );
}
