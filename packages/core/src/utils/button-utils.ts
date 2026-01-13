import { type ButtonSize } from "../types/button";

export const buttonBaseClasses =
  "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

export const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export const buttonDisabledClasses = "cursor-not-allowed opacity-60";
