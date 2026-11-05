import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export function Skeleton({
  className,
  shimmer = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-hidden="true"
      className={cn(
        "rounded-md bg-slate-200/80 dark:bg-slate-800/80",
        shimmer ? "shimmer-wave" : "animate-pulse",
        className
      )}
      {...props}
    />
  );
}
