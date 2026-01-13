/**
 * Upload utility functions
 */

import type { UploadFile, UploadFileStatus } from "../types/upload";
import { classNames } from "./class-names";

export type UploadStatusIconSize = "sm" | "lg";

export const uploadStatusIconSizeClasses: Record<UploadStatusIconSize, string> =
  {
    sm: "w-5 h-5",
    lg: "w-8 h-8",
  };

export const uploadStatusIconColorClasses: Record<UploadFileStatus, string> = {
  ready: "text-[var(--tiger-text-muted,#6b7280)]",
  uploading: "text-[var(--tiger-primary,#2563eb)]",
  success: "text-[var(--tiger-success,#16a34a)]",
  error: "text-[var(--tiger-error,#dc2626)]",
};

export function getUploadStatusIconClasses(
  status: UploadFileStatus,
  size: UploadStatusIconSize,
  options?: { spinning?: boolean }
): string {
  return classNames(
    uploadStatusIconSizeClasses[size],
    uploadStatusIconColorClasses[status],
    options?.spinning ? "animate-spin" : ""
  );
}

export type BeforeUploadHandler = (file: File) => boolean | Promise<boolean>;

export type UploadRejectReason =
  | "exceed"
  | "type"
  | "size"
  | "before-upload"
  | "before-upload-error";

export interface UploadRejectedFile {
  file: File;
  reason: UploadRejectReason;
  error?: Error;
}

export interface PrepareUploadFilesOptions {
  currentCount: number;
  incomingFiles: File[];
  limit?: number;
  accept?: string;
  maxSize?: number;
  beforeUpload?: BeforeUploadHandler;
}

export interface PrepareUploadFilesResult {
  acceptedFiles: File[];
  rejectedFiles: UploadRejectedFile[];
  rejectedExceedFiles: File[];
}

function coerceToError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);
  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error("Unknown error");
  }
}

export async function prepareUploadFiles(
  options: PrepareUploadFilesOptions
): Promise<PrepareUploadFilesResult> {
  const { currentCount, incomingFiles, limit, accept, maxSize, beforeUpload } =
    options;

  if (incomingFiles.length === 0) {
    return {
      acceptedFiles: [],
      rejectedFiles: [],
      rejectedExceedFiles: [],
    };
  }

  let candidates = incomingFiles;
  const rejectedFiles: UploadRejectedFile[] = [];
  const rejectedExceedFiles: File[] = [];

  if (limit !== undefined) {
    const remainingSlots = Math.max(0, limit - currentCount);
    if (incomingFiles.length > remainingSlots) {
      const acceptedCandidates = incomingFiles.slice(0, remainingSlots);
      const exceed = incomingFiles.slice(remainingSlots);
      candidates = acceptedCandidates;

      rejectedExceedFiles.push(...exceed);
      rejectedFiles.push(
        ...exceed.map((file) => ({
          file,
          reason: "exceed" as const,
        }))
      );
    }
  }

  const acceptedFiles: File[] = [];
  for (const file of candidates) {
    if (!validateFileType(file, accept)) {
      rejectedFiles.push({ file, reason: "type" });
      continue;
    }

    if (!validateFileSize(file, maxSize)) {
      rejectedFiles.push({ file, reason: "size" });
      continue;
    }

    if (beforeUpload) {
      try {
        const result = await beforeUpload(file);
        if (result === false) {
          rejectedFiles.push({ file, reason: "before-upload" });
          continue;
        }
      } catch (error) {
        rejectedFiles.push({
          file,
          reason: "before-upload-error",
          error: coerceToError(error),
        });
        continue;
      }
    }

    acceptedFiles.push(file);
  }

  return {
    acceptedFiles,
    rejectedFiles,
    rejectedExceedFiles,
  };
}

/**
 * Generate a unique ID for uploaded files
 * Uses timestamp and random string for uniqueness
 * @returns Unique file ID string
 */
export function generateFileId(): string {
  return `upload-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Extract file extension from filename
 * @param fileName - Name of the file
 * @returns File extension with dot (e.g., '.png') or empty string
 */
function getFileExtension(fileName: string): string {
  if (!fileName.includes(".")) return "";
  return `.${fileName.split(".").pop()?.toLowerCase() || ""}`;
}

/**
 * Create an UploadFile object from a File
 */
export function fileToUploadFile(file: File): UploadFile {
  return {
    uid: generateFileId(),
    name: file.name,
    size: file.size,
    type: file.type,
    status: "ready",
    file,
  };
}

/**
 * Validate file type against accept pattern
 * @param file - File to validate
 * @param accept - Accept pattern (e.g., 'image/*', '.png,.jpg', 'image/png')
 * @returns True if file type is accepted
 */
export function validateFileType(file: File, accept?: string): boolean {
  if (!accept) return true;

  const acceptList = accept.split(",").map((item) => item.trim());
  const fileType = file.type;
  const fileExtension = getFileExtension(file.name);

  return acceptList.some((acceptItem) => {
    // Check for exact MIME type match (e.g., 'image/png')
    if (acceptItem === fileType) return true;

    // Check for wildcard MIME type (e.g., 'image/*')
    if (acceptItem.endsWith("/*")) {
      const baseType = acceptItem.split("/")[0];
      return fileType.startsWith(`${baseType}/`);
    }

    // Check for file extension match (e.g., '.png')
    if (acceptItem.startsWith(".")) {
      return fileExtension === acceptItem.toLowerCase();
    }

    return false;
  });
}

/**
 * Validate file size
 * @param file - File to validate
 * @param maxSize - Maximum file size in bytes (0 or undefined means no limit)
 * @returns True if file size is within limit
 */
export function validateFileSize(file: File, maxSize?: number): boolean {
  if (!maxSize) return true;
  return file.size <= maxSize;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}

/**
 * Get upload button classes
 * @param drag - Whether in drag mode
 * @param disabled - Whether the button is disabled
 * @returns Complete button class string
 */
export function getUploadButtonClasses(
  drag: boolean,
  disabled: boolean
): string {
  const baseClasses = [
    "inline-flex",
    "items-center",
    "justify-center",
    "px-4",
    "py-2",
    "border",
    "border-gray-300",
    "rounded-md",
    "shadow-sm",
    "text-sm",
    "font-medium",
    "transition-colors",
    "duration-200",
  ];

  const stateClasses = disabled
    ? ["bg-gray-100", "text-gray-400", "cursor-not-allowed"]
    : [
        "bg-white",
        "text-gray-700",
        "hover:bg-gray-50",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-offset-2",
        "focus:ring-[var(--tiger-primary,#2563eb)]",
        "cursor-pointer",
      ];

  return classNames(...baseClasses, ...stateClasses);
}

/**
 * Get drag area classes
 * @param isDragging - Whether currently dragging
 * @param disabled - Whether the drag area is disabled
 * @returns Complete drag area class string
 */
export function getDragAreaClasses(
  isDragging: boolean,
  disabled: boolean
): string {
  const baseClasses = [
    "flex",
    "flex-col",
    "items-center",
    "justify-center",
    "w-full",
    "px-6",
    "py-8",
    "border-2",
    "border-dashed",
    "rounded-lg",
    "transition-all",
    "duration-200",
  ];

  const focusClasses = [
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
    "focus:ring-[var(--tiger-primary,#2563eb)]",
  ];

  let stateClasses: string[];
  if (disabled) {
    stateClasses = [
      "border-gray-200",
      "bg-gray-50",
      "cursor-not-allowed",
      "text-gray-400",
    ];
  } else if (isDragging) {
    stateClasses = [
      "border-[var(--tiger-primary,#2563eb)]",
      "bg-blue-50",
      "cursor-copy",
      ...focusClasses,
    ];
  } else {
    stateClasses = [
      "border-gray-300",
      "hover:border-[var(--tiger-primary,#2563eb)]",
      "hover:bg-gray-50",
      "cursor-pointer",
      ...focusClasses,
    ];
  }

  return classNames(...baseClasses, ...stateClasses);
}

/**
 * File list item status classes (constant for performance)
 */
const FILE_LIST_STATUS_CLASSES: Record<
  NonNullable<UploadFileStatus>,
  string[]
> = {
  ready: ["bg-gray-50", "hover:bg-gray-100"],
  uploading: ["bg-blue-50", "text-blue-700"],
  success: ["bg-green-50", "text-green-700", "hover:bg-green-100"],
  error: ["bg-red-50", "text-red-700", "hover:bg-red-100"],
};

/**
 * Picture card status classes (constant for performance)
 */
const PICTURE_CARD_STATUS_CLASSES: Record<
  NonNullable<UploadFileStatus>,
  string[]
> = {
  ready: ["border-gray-300"],
  uploading: ["border-blue-400", "bg-blue-50"],
  success: ["border-gray-300", "hover:border-blue-400"],
  error: ["border-red-400", "bg-red-50"],
};

/**
 * Get file list item classes based on status
 * @param status - Upload file status
 * @returns Complete file list item class string
 */
export function getFileListItemClasses(status?: UploadFileStatus): string {
  const baseClasses = [
    "flex",
    "items-center",
    "justify-between",
    "px-3",
    "py-2",
    "rounded",
    "transition-colors",
    "duration-200",
  ];

  const stateClasses = status
    ? FILE_LIST_STATUS_CLASSES[status]
    : FILE_LIST_STATUS_CLASSES.ready;

  return classNames(...baseClasses, ...stateClasses);
}

/**
 * Get picture card item classes
 * @param status - Upload file status
 * @returns Complete picture card class string
 */
export function getPictureCardClasses(status?: UploadFileStatus): string {
  const baseClasses = [
    "relative",
    "inline-flex",
    "items-center",
    "justify-center",
    "w-32",
    "h-32",
    "border",
    "rounded-lg",
    "overflow-hidden",
    "transition-all",
    "duration-200",
  ];

  const stateClasses = status
    ? PICTURE_CARD_STATUS_CLASSES[status]
    : PICTURE_CARD_STATUS_CLASSES.ready;

  return classNames(...baseClasses, ...stateClasses);
}
