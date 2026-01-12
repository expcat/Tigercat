/**
 * Loading/Spinner component utilities
 */

import { classNames } from "./class-names";
import type {
  LoadingSize,
  LoadingColor,
  LoadingVariant,
} from "../types/loading";

/**
 * Loading size dimension mappings
 */
export const loadingSizeClasses: Record<LoadingSize, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
  xl: "h-16 w-16",
};

/**
 * Loading text size classes
 */
export const loadingTextSizeClasses: Record<LoadingSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

/**
 * Loading color classes using CSS variables
 */
export const loadingColorClasses: Record<LoadingColor, string> = {
  primary: "text-[var(--tiger-primary,#2563eb)]",
  secondary: "text-[var(--tiger-secondary,#4b5563)]",
  success: "text-[var(--tiger-success,#16a34a)]",
  warning: "text-[var(--tiger-warning,#ca8a04)]",
  danger: "text-[var(--tiger-error,#dc2626)]",
  info: "text-[var(--tiger-info,#3b82f6)]",
  default: "text-[var(--tiger-text-muted,#6b7280)]",
};

/**
 * Base classes for loading container
 */
export const loadingContainerBaseClasses =
  "inline-flex flex-col items-center justify-center gap-2";

/**
 * Base classes for fullscreen loading
 */
export const loadingFullscreenBaseClasses =
  "fixed inset-0 z-50 flex items-center justify-center";

/**
 * Base classes for spinner animation
 */
export const loadingSpinnerBaseClasses = "animate-spin";

/**
 * Get loading spinner classes
 */
export function getLoadingClasses(
  variant: LoadingVariant,
  size: LoadingSize,
  color: LoadingColor,
  customColor?: string
): string {
  const sizeClass = loadingSizeClasses[size];
  const colorClass = customColor ? "" : loadingColorClasses[color];

  const baseClasses = classNames(sizeClass, colorClass);

  switch (variant) {
    case "spinner":
      return classNames(baseClasses, loadingSpinnerBaseClasses);
    case "dots":
      return baseClasses;
    case "bars":
      return baseClasses;
    case "ring":
      return classNames(baseClasses, loadingSpinnerBaseClasses);
    case "pulse":
      return classNames(baseClasses, "animate-pulse");
    default:
      return classNames(baseClasses, loadingSpinnerBaseClasses);
  }
}

/**
 * Get spinner SVG path for different variants
 */
export function getSpinnerSVG(variant: LoadingVariant): {
  viewBox: string;
  elements: Array<{ type: string; attrs: Record<string, unknown> }>;
} {
  switch (variant) {
    case "spinner":
      return {
        viewBox: "0 0 24 24",
        elements: [
          {
            type: "circle",
            attrs: {
              className: "opacity-25",
              cx: "12",
              cy: "12",
              r: "10",
              stroke: "currentColor",
              strokeWidth: "4",
              fill: "none",
            },
          },
          {
            type: "path",
            attrs: {
              className: "opacity-75",
              fill: "currentColor",
              d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z",
            },
          },
        ],
      };

    case "ring":
      return {
        viewBox: "0 0 24 24",
        elements: [
          {
            type: "circle",
            attrs: {
              className: "opacity-25",
              cx: "12",
              cy: "12",
              r: "10",
              stroke: "currentColor",
              strokeWidth: "3",
              fill: "none",
            },
          },
          {
            type: "circle",
            attrs: {
              className: "opacity-75",
              cx: "12",
              cy: "12",
              r: "10",
              stroke: "currentColor",
              strokeWidth: "3",
              fill: "none",
              strokeLinecap: "round",
              strokeDasharray: "48 16",
            },
          },
        ],
      };

    case "pulse":
      return {
        viewBox: "0 0 24 24",
        elements: [
          {
            type: "circle",
            attrs: {
              cx: "12",
              cy: "12",
              r: "10",
              fill: "currentColor",
            },
          },
        ],
      };

    default:
      return {
        viewBox: "0 0 24 24",
        elements: [
          {
            type: "circle",
            attrs: {
              className: "opacity-25",
              cx: "12",
              cy: "12",
              r: "10",
              stroke: "currentColor",
              strokeWidth: "4",
              fill: "none",
            },
          },
        ],
      };
  }
}

/**
 * Dots variant dimensions based on size
 */
export const dotsVariantConfig: Record<
  LoadingSize,
  { dotSize: string; gap: string }
> = {
  sm: { dotSize: "h-1 w-1", gap: "gap-0.5" },
  md: { dotSize: "h-1.5 w-1.5", gap: "gap-1" },
  lg: { dotSize: "h-2.5 w-2.5", gap: "gap-1.5" },
  xl: { dotSize: "h-4 w-4", gap: "gap-2" },
};

/**
 * Bars variant dimensions based on size
 */
export const barsVariantConfig: Record<
  LoadingSize,
  { barWidth: string; barHeight: string; gap: string }
> = {
  sm: { barWidth: "w-0.5", barHeight: "h-3", gap: "gap-0.5" },
  md: { barWidth: "w-1", barHeight: "h-5", gap: "gap-1" },
  lg: { barWidth: "w-1.5", barHeight: "h-8", gap: "gap-1.5" },
  xl: { barWidth: "w-2", barHeight: "h-12", gap: "gap-2" },
};

/**
 * Animation delay classes for dots and bars
 */
export const animationDelayClasses = [
  "animation-delay-0",
  "animation-delay-150",
  "animation-delay-300",
];

/**
 * CSS for custom animation delays
 */
export const animationDelayStyles = `
@keyframes bounce-dot {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-100%); }
}

@keyframes scale-bar {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.5); }
}

.animate-bounce-dot {
  animation: bounce-dot 0.6s ease-in-out infinite;
}

.animate-scale-bar {
  animation: scale-bar 0.6s ease-in-out infinite;
}

.animation-delay-0 {
  animation-delay: 0s;
}

.animation-delay-150 {
  animation-delay: 0.15s;
}

.animation-delay-300 {
  animation-delay: 0.3s;
}
`;

/**
 * Injects animation styles into the document head
 * This is a shared utility to avoid code duplication
 */
export function injectLoadingAnimationStyles(): void {
  if (typeof document === "undefined") {
    return;
  }

  try {
    const styleId = "tiger-loading-animations";
    if (!document.getElementById(styleId)) {
      if (!document.head) {
        console.warn("Tigercat Loading: document.head is not available");
        return;
      }

      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = animationDelayStyles;
      document.head.appendChild(style);
    }
  } catch (error) {
    console.error("Tigercat Loading: Failed to inject animation styles", error);
  }
}
