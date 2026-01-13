import React, { useRef, useState, useCallback } from "react";
import {
  type UploadProps as CoreUploadProps,
  type UploadFile,
  classNames,
  getSpinnerSVG,
  prepareUploadFiles,
  fileToUploadFile,
  formatFileSize,
  getUploadButtonClasses,
  getDragAreaClasses,
  getFileListItemClasses,
  getPictureCardClasses,
} from "@tigercat/core";

export interface UploadProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      "onChange" | "onError" | "onProgress"
    >,
    Omit<CoreUploadProps, "onChange" | "onRemove"> {
  /**
   * File list change callback
   */
  onChange?: (file: UploadFile, fileList: UploadFile[]) => void;

  /**
   * File remove callback
   */
  onRemove?: (file: UploadFile, fileList: UploadFile[]) => void | boolean;

  // children/className/style 等由 React.HTMLAttributes<HTMLDivElement> 提供
}

export const Upload: React.FC<UploadProps> = ({
  accept,
  multiple = false,
  limit,
  maxSize,
  disabled = false,
  drag = false,
  listType = "text",
  fileList: controlledFileList,
  showFileList = true,
  autoUpload = true,
  customRequest,
  onChange,
  onRemove,
  onPreview,
  beforeUpload,
  onProgress,
  onSuccess,
  onError,
  onExceed,
  children,
  className,
  style,
  ...divProps
}) => {
  const spinnerSvg = getSpinnerSVG("spinner");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [internalFileList, setInternalFileList] = useState<UploadFile[]>([]);

  // Use controlled or uncontrolled mode
  const isControlled = controlledFileList !== undefined;
  const fileList = isControlled ? controlledFileList : internalFileList;

  const updateFileList = useCallback(
    (newFileList: UploadFile[]) => {
      if (!isControlled) {
        setInternalFileList(newFileList);
      }
    },
    [isControlled]
  );

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    await processFiles(files);
    // Reset input value to allow selecting the same file again
    if (event.target) {
      event.target.value = "";
    }
  };

  const processFiles = async (incomingFiles: File[]) => {
    if (incomingFiles.length === 0) return;

    const prepared = await prepareUploadFiles({
      currentCount: fileList.length,
      incomingFiles,
      limit,
      accept,
      maxSize,
      beforeUpload,
    });

    if (prepared.rejectedExceedFiles.length > 0) {
      onExceed?.(prepared.rejectedExceedFiles, fileList);
    }

    // Important: fileList is a snapshot (state/props). Use a local accumulator
    // to avoid overwriting previous files when selecting multiple at once.
    let nextFileList = [...fileList];

    for (const file of prepared.acceptedFiles) {
      const uploadFile = fileToUploadFile(file);

      // Add to file list
      nextFileList = [...nextFileList, uploadFile];
      updateFileList(nextFileList);

      if (onChange) {
        onChange(uploadFile, nextFileList);
      }

      // Auto upload if enabled
      if (autoUpload) {
        uploadFile.status = "uploading";
        if (customRequest) {
          customRequest({
            file,
            onProgress: (progress: number) => {
              uploadFile.progress = progress;
              if (onProgress) {
                onProgress(progress, uploadFile);
              }
            },
            onSuccess: (response: unknown) => {
              uploadFile.status = "success";
              if (onSuccess) {
                onSuccess(response, uploadFile);
              }
            },
            onError: (error: Error) => {
              uploadFile.status = "error";
              uploadFile.error = error.message;
              if (onError) {
                onError(error, uploadFile);
              }
            },
          });
        } else {
          // Simulate upload for demo purposes
          uploadFile.status = "success";
        }
      }
    }
  };

  const handleRemove = (file: UploadFile) => {
    const newFileList = fileList.filter((f) => f.uid !== file.uid);

    const removeResult = onRemove?.(file, newFileList);
    if (removeResult === false) return;

    updateFileList(newFileList);
    // Keep controlled mode in sync (demo relies on onChange)
    onChange?.(file, newFileList);
  };

  const handlePreview = (file: UploadFile) => {
    if (onPreview) {
      onPreview(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    if (disabled) return;
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    if (disabled) return;
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (event: React.DragEvent) => {
    if (disabled) return;
    event.preventDefault();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer?.files || []);
    await processFiles(files);
  };

  const renderUploadButton = () => {
    if (drag) {
      return (
        <div
          className={getDragAreaClasses(isDragging, disabled)}
          onClick={handleClick}
          onKeyDown={handleDragKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          aria-label="Upload file by clicking or dragging"
        >
          <svg
            className="w-12 h-12 mb-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="mb-2 text-sm">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
          {accept && (
            <p className="text-xs text-gray-500">Accepted: {accept}</p>
          )}
          {maxSize && (
            <p className="text-xs text-gray-500">
              Max size: {formatFileSize(maxSize)}
            </p>
          )}
        </div>
      );
    }

    return (
      <button
        type="button"
        className={getUploadButtonClasses(drag, disabled)}
        onClick={handleClick}
        disabled={disabled}
        aria-label="Upload file"
      >
        {children || "Select File"}
      </button>
    );
  };

  const renderFileList = () => {
    if (!showFileList || fileList.length === 0) {
      return null;
    }

    if (listType === "picture-card") {
      return (
        <div className="flex flex-wrap gap-2 mt-4">
          {fileList.map((file) => renderPictureCard(file))}
        </div>
      );
    }

    return (
      <ul className="mt-4 space-y-2" role="list" aria-label="Uploaded files">
        {fileList.map((file) => renderFileItem(file))}
      </ul>
    );
  };

  const renderFileItem = (file: UploadFile) => {
    return (
      <li key={file.uid} className={getFileListItemClasses(file.status)}>
        <div className="flex items-center flex-1 min-w-0">
          {/* File icon */}
          <svg
            className="w-5 h-5 mr-2 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {/* File name and size */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            {file.size && (
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </p>
            )}
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          {/* Status icon */}
          {file.status === "success" && (
            <svg
              className="w-5 h-5 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-label="Success"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {file.status === "error" && (
            <svg
              className="w-5 h-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-label="Error"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {file.status === "uploading" && (
            <svg
              className="w-5 h-5 text-blue-500 animate-spin"
              fill="none"
              viewBox={spinnerSvg.viewBox}
              aria-label="Uploading"
            >
              {spinnerSvg.elements.map((el, index) => {
                if (el.type === "circle") return <circle key={index} {...el.attrs} />;
                if (el.type === "path") return <path key={index} {...el.attrs} />;
                return null;
              })}
            </svg>
          )}
          {/* Remove button */}
          <button
            type="button"
            className="text-gray-400 hover:text-red-500 transition-colors"
            onClick={() => handleRemove(file)}
            aria-label={`Remove ${file.name}`}
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </li>
    );
  };

  const renderPictureCard = (file: UploadFile) => {
    const imageUrl =
      file.url || (file.file ? URL.createObjectURL(file.file) : "");

    return (
      <div key={file.uid} className={getPictureCardClasses(file.status)}>
        {/* Image preview */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all flex items-center justify-center space-x-2 opacity-0 hover:opacity-100">
          {/* Preview button */}
          <button
            type="button"
            className="text-white hover:text-blue-200 transition-colors"
            onClick={() => handlePreview(file)}
            aria-label={`Preview ${file.name}`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
          {/* Remove button */}
          <button
            type="button"
            className="text-white hover:text-red-200 transition-colors"
            onClick={() => handleRemove(file)}
            aria-label={`Remove ${file.name}`}
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        {/* Status indicator */}
        {file.status === "uploading" && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-500 animate-spin"
              fill="none"
              viewBox={spinnerSvg.viewBox}
            >
              {spinnerSvg.elements.map((el, index) => {
                if (el.type === "circle") return <circle key={index} {...el.attrs} />;
                if (el.type === "path") return <path key={index} {...el.attrs} />;
                return null;
              })}
            </svg>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      {...divProps}
      className={classNames("tiger-upload", className)}
      style={style}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        style={{ display: "none" }}
        onChange={handleFileChange}
        aria-hidden="true"
      />
      {renderUploadButton()}
      {renderFileList()}
    </div>
  );
};
