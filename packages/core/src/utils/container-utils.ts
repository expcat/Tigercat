import { classNames } from "./class-names";
import { type ContainerMaxWidth } from "../types/container";

export const containerBaseClasses = "w-full";

export const containerCenteredClasses = "mx-auto";

export const containerPaddingClasses = "px-4 sm:px-6 lg:px-8";

export const containerMaxWidthClasses: Record<
  Exclude<ContainerMaxWidth, false>,
  string
> = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "w-full",
} as const;

export interface GetContainerClassesOptions {
  maxWidth?: ContainerMaxWidth;
  center?: boolean;
  padding?: boolean;
  className?: string;
}

export const getContainerClasses = ({
  maxWidth = false,
  center = true,
  padding = true,
  className,
}: GetContainerClassesOptions = {}) =>
  classNames(
    containerBaseClasses,
    maxWidth !== false && containerMaxWidthClasses[maxWidth],
    center && containerCenteredClasses,
    padding && containerPaddingClasses,
    className
  );
