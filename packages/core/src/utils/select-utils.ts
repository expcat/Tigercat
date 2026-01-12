/**
 * Utility functions for Select component styling
 */

import type {
  SelectOptions,
  SelectSize,
  SelectOption,
  SelectOptionGroup,
} from "../types/select";
import { classNames } from "./class-names";

/**
 * Base select container classes
 */
export const selectBaseClasses = "relative inline-block w-full";

/**
 * Select trigger button base classes
 */
const SELECT_TRIGGER_BASE_CLASSES = [
  "w-full",
  "flex",
  "items-center",
  "justify-between",
  "gap-2",
  "px-3",
  "py-2",
  "bg-white",
  "border",
  "border-gray-300",
  "rounded-md",
  "shadow-sm",
  "cursor-pointer",
  "transition-colors",
  "focus:outline-none",
  "focus:ring-2",
  "focus:ring-[var(--tiger-primary,#2563eb)]",
  "focus:border-[var(--tiger-primary,#2563eb)]",
] as const;

/**
 * Select trigger disabled classes (combined string for performance)
 */
const SELECT_TRIGGER_DISABLED_CLASSES_STRING = [
  "disabled:bg-gray-50",
  "disabled:text-gray-500",
  "disabled:cursor-not-allowed",
  "disabled:border-gray-200",
].join(" ");

/**
 * Select dropdown base classes
 */
export const selectDropdownBaseClasses =
  "absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto";

/**
 * Select option base classes
 */
export const selectOptionBaseClasses =
  "w-full px-3 py-2 text-left cursor-pointer transition-colors hover:bg-[var(--tiger-outline-bg-hover,#eff6ff)]";

/**
 * Select option selected classes
 */
export const selectOptionSelectedClasses =
  "bg-[var(--tiger-outline-bg-hover,#eff6ff)] text-[var(--tiger-primary,#2563eb)] font-medium";

/**
 * Select option disabled classes
 */
export const selectOptionDisabledClasses =
  "opacity-50 cursor-not-allowed hover:bg-white";

/**
 * Select group label classes
 */
export const selectGroupLabelClasses =
  "px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50";

/**
 * Select search input classes
 */
export const selectSearchInputClasses =
  "w-full px-3 py-2 border-b border-gray-200 focus:outline-none focus:ring-0";

/**
 * Select empty state classes
 */
export const selectEmptyStateClasses =
  "px-3 py-8 text-center text-gray-500 text-sm";

/**
 * Select size classes map (constant for performance)
 */
const SELECT_SIZE_CLASSES: Record<SelectSize, string> = {
  sm: "text-sm py-1.5",
  md: "text-base py-2",
  lg: "text-lg py-2.5",
};

/**
 * Get select size classes
 * @param size - Select size variant
 * @returns Size-specific class string
 */
export function getSelectSizeClasses(size: SelectSize): string {
  return SELECT_SIZE_CLASSES[size];
}

/**
 * Get select trigger classes
 * @param size - Select size
 * @param disabled - Whether the select is disabled
 * @param isOpen - Whether the dropdown is open
 * @returns Complete trigger class string
 */
export function getSelectTriggerClasses(
  size: SelectSize,
  disabled: boolean,
  isOpen: boolean
): string {
  return classNames(
    ...SELECT_TRIGGER_BASE_CLASSES,
    getSelectSizeClasses(size),
    disabled && SELECT_TRIGGER_DISABLED_CLASSES_STRING,
    isOpen &&
      "ring-2 ring-[var(--tiger-primary,#2563eb)] border-[var(--tiger-primary,#2563eb)]"
  );
}

/**
 * Get select option classes
 * @param isSelected - Whether the option is selected
 * @param isDisabled - Whether the option is disabled
 * @param size - Select size
 * @returns Complete option class string
 */
export function getSelectOptionClasses(
  isSelected: boolean,
  isDisabled: boolean,
  size: SelectSize
): string {
  return classNames(
    selectOptionBaseClasses,
    getSelectSizeClasses(size),
    isSelected && selectOptionSelectedClasses,
    isDisabled && selectOptionDisabledClasses
  );
}

/**
 * Type guard to check if an option is a group
 * @param option - Option to check
 * @returns True if option is a SelectOptionGroup
 */
export function isOptionGroup(
  option: SelectOption | SelectOptionGroup | null | undefined
): option is SelectOptionGroup {
  return (
    !!option &&
    typeof option === "object" &&
    "options" in option &&
    Array.isArray(option.options)
  );
}

/**
 * Filter options based on search query
 * @param options - Array of options or option groups to filter
 * @param query - Search query string
 * @returns Filtered options array
 */
export function filterOptions(
  options: SelectOptions,
  query: string
): SelectOptions {
  if (!query) {
    return options;
  }

  const searchLower = query.toLowerCase();

  return options.reduce<SelectOptions>((filtered, option) => {
    if (isOptionGroup(option)) {
      // Filter options within the group
      const filteredGroupOptions = option.options.filter((opt) =>
        opt.label.toLowerCase().includes(searchLower)
      );

      // Only include the group if it has matching options
      if (filteredGroupOptions.length > 0) {
        filtered.push({
          ...option,
          options: filteredGroupOptions,
        });
      }
    } else {
      // Include option if label matches
      if (option.label.toLowerCase().includes(searchLower)) {
        filtered.push(option);
      }
    }
    return filtered;
  }, []);
}
