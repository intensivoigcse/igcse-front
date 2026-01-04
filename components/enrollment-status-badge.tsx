"use client";

import { cn } from "@/lib/utils";

type EnrollmentStatus = "pending" | "accepted" | "rejected";

interface EnrollmentStatusBadgeProps {
  status: EnrollmentStatus;
  className?: string;
}

export function EnrollmentStatusBadge({ status, className }: EnrollmentStatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "accepted":
        return "Aceptado";
      case "rejected":
        return "Rechazado";
      default:
        return status;
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        getStatusStyles(),
        className
      )}
    >
      {getStatusLabel()}
    </span>
  );
}

