import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine les classes Tailwind intelligemment (évite les doublons et conflits)
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
