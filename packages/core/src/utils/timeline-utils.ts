/**
 * Timeline component utilities
 * Shared styles and helpers for Timeline components
 */

import type { TimelineMode, TimelineItemPosition } from "../types/timeline";

/**
 * Base timeline container classes
 */
export const timelineContainerClasses = "relative";

/**
 * Timeline list classes
 */
export const timelineListClasses = "list-none m-0 p-0";

/**
 * Timeline item base classes
 */
export const timelineItemClasses = "relative pb-8 last:pb-0";

/**
 * Timeline item tail (connector line) classes
 */
export const timelineTailClasses =
  "absolute w-0.5 bg-[var(--tiger-border,#e5e7eb)]";

/**
 * Timeline item head (dot container) classes
 */
export const timelineHeadClasses = "absolute flex items-center justify-center";

/**
 * Timeline default dot classes
 */
const timelineDotBgClass = "bg-[var(--tiger-timeline-dot,#d1d5db)]";
export const timelineDotClasses = `w-2.5 h-2.5 rounded-full border-2 border-[var(--tiger-surface,#ffffff)] ${timelineDotBgClass}`;

/**
 * Timeline custom dot classes
 */
export const timelineCustomDotClasses = "flex items-center justify-center";

/**
 * Timeline content wrapper classes
 */
export const timelineContentClasses = "relative";

/**
 * Timeline label classes
 */
export const timelineLabelClasses =
  "text-sm text-[var(--tiger-text-muted,#6b7280)] mb-1";

/**
 * Timeline description classes
 */
export const timelineDescriptionClasses = "text-[var(--tiger-text,#374151)]";

/**
 * Get timeline container classes based on mode
 * @param mode - Timeline mode (left, right, alternate)
 * @returns Combined class string for timeline container
 */
export function getTimelineContainerClasses(mode: TimelineMode): string {
  const classes = [timelineContainerClasses];

  if (mode === "left" || mode === "right") {
    classes.push("pl-0");
  } else if (mode === "alternate") {
    classes.push("flex flex-col");
  }

  return classes.join(" ");
}

/**
 * Get timeline item classes based on mode and position
 * @param mode - Timeline mode
 * @param position - Item position (for alternate mode)
 * @param isLast - Whether this is the last item
 * @returns Combined class string for timeline item
 */
export function getTimelineItemClasses(
  mode: TimelineMode,
  position?: TimelineItemPosition,
  isLast = false
): string {
  const classes = [timelineItemClasses];

  if (mode === "left") {
    classes.push("pl-8");
  } else if (mode === "right") {
    classes.push("pr-8 text-right");
  } else if (mode === "alternate") {
    if (position === "left") {
      classes.push("pr-8 text-right flex flex-row-reverse");
    } else {
      classes.push("pl-8 flex");
    }
  }

  if (isLast) {
    classes.push("pb-0");
  }

  return classes.join(" ");
}

/**
 * Get timeline tail (connector line) classes
 * @param mode - Timeline mode
 * @param position - Item position (for alternate mode)
 * @param isLast - Whether this is the last item
 * @returns Combined class string for timeline tail
 */
export function getTimelineTailClasses(
  mode: TimelineMode,
  position?: TimelineItemPosition,
  isLast = false
): string {
  if (isLast) {
    return "hidden";
  }

  const classes = [timelineTailClasses];

  if (mode === "left") {
    // Align with head (dot) center and start line below the dot
    classes.push("left-0 -translate-x-1/2 top-[10px] bottom-0");
  } else if (mode === "right") {
    classes.push("right-0 translate-x-1/2 top-[10px] bottom-0");
  } else if (mode === "alternate") {
    classes.push("left-1/2 -translate-x-1/2 top-[10px] bottom-0");
  }

  return classes.join(" ");
}

/**
 * Get timeline head (dot container) classes
 * @param mode - Timeline mode
 * @param _position - Item position (for alternate mode) - not currently used as head is always centered in alternate mode
 * @returns Combined class string for timeline head
 */
export function getTimelineHeadClasses(
  mode: TimelineMode,
  _position?: TimelineItemPosition
): string {
  const classes = [timelineHeadClasses];

  if (mode === "left") {
    classes.push("left-0 top-0 -translate-x-1/2");
  } else if (mode === "right") {
    classes.push("right-0 top-0 translate-x-1/2");
  } else if (mode === "alternate") {
    classes.push("left-1/2 -translate-x-1/2 top-0");
  }

  return classes.join(" ");
}

/**
 * Get timeline dot classes with custom color
 * @param color - Custom color (CSS color value)
 * @param isCustom - Whether using custom dot content
 * @returns Combined class string for timeline dot
 */
export function getTimelineDotClasses(
  color?: string,
  isCustom = false
): string {
  if (isCustom) {
    return timelineCustomDotClasses;
  }

  const classes = [timelineDotClasses];

  // If custom color is provided, it should be applied via inline styles
  // but we can add predefined color classes
  if (color) {
    return classes.join(" ").replace(timelineDotBgClass, "");
  }

  return classes.join(" ");
}

/**
 * Get timeline content classes based on mode and position
 * @param mode - Timeline mode
 * @param position - Item position (for alternate mode)
 * @returns Combined class string for timeline content
 */
export function getTimelineContentClasses(
  mode: TimelineMode,
  position?: TimelineItemPosition
): string {
  const classes = [timelineContentClasses];

  if (mode === "left") {
    classes.push("pl-2");
  } else if (mode === "right") {
    classes.push("pr-2");
  } else if (mode === "alternate") {
    if (position === "left") {
      classes.push("pr-8");
    } else {
      classes.push("pl-8");
    }
  }

  return classes.join(" ");
}

/**
 * Get pending dot classes
 * @returns Class string for pending state dot
 */
export function getPendingDotClasses(): string {
  return "w-2.5 h-2.5 rounded-full border-2 border-white bg-[var(--tiger-primary,#2563eb)] animate-pulse";
}
