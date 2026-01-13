import { defineComponent, ref, computed, watch, h, PropType } from "vue";
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  type UploadFile,
  type UploadListType,
  type UploadRequestOptions,
  prepareUploadFiles,
  fileToUploadFile,
  formatFileSize,
  getUploadButtonClasses,
  getDragAreaClasses,
  getFileListItemClasses,
  getPictureCardClasses,
} from "@tigercat/core";

export interface VueUploadProps {
  accept?: string;
  multiple?: boolean;
  limit?: number;
  maxSize?: number;
  disabled?: boolean;
  drag?: boolean;
  listType?: UploadListType;
  fileList?: UploadFile[];
  showFileList?: boolean;
  autoUpload?: boolean;
  customRequest?: (options: UploadRequestOptions) => void;
  beforeUpload?: (file: File) => boolean | Promise<boolean>;
  className?: string;
  style?: Record<string, string | number>;
}

export const Upload = defineComponent({
  name: "TigerUpload",
  inheritAttrs: false,
  props: {
    /**
     * Additional CSS classes
     */
    className: {
      type: String as PropType<string>,
      default: undefined,
    },

    /**
     * Custom styles
     */
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined,
    },

    /**
     * Accepted file types (e.g., 'image/*', '.pdf')
     */
    accept: {
      type: String,
    },
    /**
     * Whether to allow multiple file selection
     * @default false
     */
    multiple: {
      type: Boolean,
      default: false,
    },
    /**
     * Maximum number of files
     */
    limit: {
      type: Number,
    },
    /**
     * Maximum file size in bytes
     */
    maxSize: {
      type: Number,
    },
    /**
     * Whether the upload is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether to enable drag and drop
     * @default false
     */
    drag: {
      type: Boolean,
      default: false,
    },
    /**
     * List type for displaying files
     * @default 'text'
     */
    listType: {
      type: String as PropType<UploadListType>,
      default: "text" as UploadListType,
    },
    /**
     * List of uploaded files (v-model:file-list)
     */
    fileList: {
      type: Array as PropType<UploadFile[]>,
      default: undefined,
    },
    /**
     * Whether to show the file list
     * @default true
     */
    showFileList: {
      type: Boolean,
      default: true,
    },
    /**
     * Whether to auto upload when file is selected
     * @default true
     */
    autoUpload: {
      type: Boolean,
      default: true,
    },
    /**
     * Custom upload request function
     */
    customRequest: {
      type: Function as PropType<(options: UploadRequestOptions) => void>,
    },
    /**
     * Before upload callback - return false to prevent upload
     */
    beforeUpload: {
      type: Function as PropType<(file: File) => boolean | Promise<boolean>>,
    },
  },
  emits: {
    /**
     * Emitted when file list changes (for v-model:file-list)
     */
    "update:file-list": (files: UploadFile[]) => Array.isArray(files),
    /**
     * Emitted when file list changes
     */
    change: (_file: UploadFile, _fileList: UploadFile[]) => true,
    /**
     * Emitted when file is removed
     */
    remove: (_file: UploadFile, _fileList: UploadFile[]) => true,
    /**
     * Emitted when file is previewed
     */
    preview: (_file: UploadFile) => true,
    /**
     * Emitted on upload progress
     */
    progress: (progress: number, _file: UploadFile) =>
      typeof progress === "number",
    /**
     * Emitted on upload success
     */
    success: (_response: unknown, _file: UploadFile) => true,
    /**
     * Emitted on upload error
     */
    error: (error: Error, _file: UploadFile) => error instanceof Error,
    /**
     * Emitted when file limit is exceeded
     */
    exceed: (files: File[], fileList: UploadFile[]) =>
      Array.isArray(files) && Array.isArray(fileList),
  },
  setup(props, { emit, slots, attrs }) {
    const inputRef = ref<HTMLInputElement | null>(null);
    const isDragging = ref(false);
    const attrsRecord = attrs as Record<string, unknown>;

    const isControlled = computed(() => props.fileList !== undefined);
    const internalFileList = ref<UploadFile[]>(
      props.fileList ? [...props.fileList] : []
    );

    watch(
      () => props.fileList,
      (value) => {
        if (value !== undefined) {
          internalFileList.value = [...value];
        }
      },
      { deep: true }
    );

    const fileListValue = computed<UploadFile[]>(() => {
      if (isControlled.value) {
        return props.fileList ?? [];
      }
      return internalFileList.value;
    });

    const setFileList = (value: UploadFile[]) => {
      if (!isControlled.value) {
        internalFileList.value = value;
      }
      emit("update:file-list", value);
    };

    const handleClick = () => {
      if (props.disabled) return;
      inputRef.value?.click();
    };

    const handleFileChange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const files = Array.from(target.files || []);
      await processFiles(files);
      // Reset input value to allow selecting the same file again
      if (target) {
        target.value = "";
      }
    };

    const processFiles = async (incomingFiles: File[]) => {
      if (incomingFiles.length === 0) return;

      const prepared = await prepareUploadFiles({
        currentCount: fileListValue.value.length,
        incomingFiles,
        limit: props.limit,
        accept: props.accept,
        maxSize: props.maxSize,
        beforeUpload: props.beforeUpload,
      });

      if (prepared.rejectedExceedFiles.length > 0) {
        emit("exceed", prepared.rejectedExceedFiles, fileListValue.value);
      }

      // Important: fileListValue is a snapshot (props/state). Use a local accumulator
      // to avoid overwriting previous files when selecting multiple at once.
      let nextFileList = [...fileListValue.value];

      for (const file of prepared.acceptedFiles) {
        const uploadFile = fileToUploadFile(file);

        // Add to file list
        nextFileList = [...nextFileList, uploadFile];
        setFileList(nextFileList);
        emit("change", uploadFile, nextFileList);

        // Auto upload if enabled
        if (props.autoUpload) {
          uploadFile.status = "uploading";
          if (props.customRequest) {
            props.customRequest({
              file,
              onProgress: (progress: number) => {
                uploadFile.progress = progress;
                emit("progress", progress, uploadFile);
              },
              onSuccess: (response: unknown) => {
                uploadFile.status = "success";
                emit("success", response, uploadFile);
              },
              onError: (error: Error) => {
                uploadFile.status = "error";
                uploadFile.error = error.message;
                emit("error", error, uploadFile);
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
      const newFileList = fileListValue.value.filter((f) => f.uid !== file.uid);
      setFileList(newFileList);
      emit("remove", file, newFileList);
      emit("change", file, newFileList);
    };

    const handlePreview = (file: UploadFile) => {
      emit("preview", file);
    };

    const handleDragOver = (event: DragEvent) => {
      if (props.disabled) return;
      event.preventDefault();
      isDragging.value = true;
    };

    const handleDragLeave = (event: DragEvent) => {
      if (props.disabled) return;
      event.preventDefault();
      isDragging.value = false;
    };

    const handleDrop = async (event: DragEvent) => {
      if (props.disabled) return;
      event.preventDefault();
      isDragging.value = false;

      const files = Array.from(event.dataTransfer?.files || []);
      await processFiles(files);
    };

    const handleDragKeydown = (event: KeyboardEvent) => {
      if (props.disabled) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleClick();
      }
    };

    const renderInput = () => {
      return h("input", {
        ref: inputRef,
        type: "file",
        accept: props.accept,
        multiple: props.multiple,
        disabled: props.disabled,
        style: { display: "none" },
        onChange: handleFileChange,
        "aria-hidden": "true",
      });
    };

    const renderUploadButton = () => {
      if (props.drag) {
        return h(
          "div",
          {
            class: getDragAreaClasses(isDragging.value, props.disabled),
            onClick: handleClick,
            onKeydown: handleDragKeydown,
            onDragover: handleDragOver,
            onDragleave: handleDragLeave,
            onDrop: handleDrop,
            role: "button",
            tabindex: props.disabled ? -1 : 0,
            "aria-disabled": props.disabled,
            "aria-label": "Upload file by clicking or dragging",
          },
          [
            h(
              "svg",
              {
                class: "w-12 h-12 mb-3 text-gray-400",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                "aria-hidden": "true",
              },
              [
                h("path", {
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  "stroke-width": "2",
                  d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
                }),
              ]
            ),
            h("p", { class: "mb-2 text-sm" }, [
              h("span", { class: "font-semibold" }, "Click to upload"),
              " or drag and drop",
            ]),
            props.accept &&
              h(
                "p",
                { class: "text-xs text-gray-500" },
                `Accepted: ${props.accept}`
              ),
            props.maxSize &&
              h(
                "p",
                { class: "text-xs text-gray-500" },
                `Max size: ${formatFileSize(props.maxSize)}`
              ),
          ]
        );
      }

      return h(
        "button",
        {
          type: "button",
          class: getUploadButtonClasses(props.drag, props.disabled),
          onClick: handleClick,
          disabled: props.disabled,
          "aria-label": "Upload file",
        },
        slots.default ? slots.default() : "Select File"
      );
    };

    const renderFileList = () => {
      if (!props.showFileList || fileListValue.value.length === 0) {
        return null;
      }

      if (props.listType === "picture-card") {
        return h(
          "div",
          { class: "flex flex-wrap gap-2 mt-4" },
          fileListValue.value.map((file) => renderPictureCard(file))
        );
      }

      return h(
        "ul",
        {
          class: "mt-4 space-y-2",
          role: "list",
          "aria-label": "Uploaded files",
        },
        fileListValue.value.map((file) => renderFileItem(file))
      );
    };

    const renderFileItem = (file: UploadFile) => {
      return h(
        "li",
        {
          class: getFileListItemClasses(file.status),
          key: file.uid,
        },
        [
          h("div", { class: "flex items-center flex-1 min-w-0" }, [
            // File icon
            h(
              "svg",
              {
                class: "w-5 h-5 mr-2 flex-shrink-0",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                "aria-hidden": "true",
              },
              [
                h("path", {
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  "stroke-width": "2",
                  d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                }),
              ]
            ),
            // File name and size
            h("div", { class: "flex-1 min-w-0" }, [
              h("p", { class: "text-sm font-medium truncate" }, file.name),
              file.size &&
                h(
                  "p",
                  { class: "text-xs text-gray-500" },
                  formatFileSize(file.size)
                ),
            ]),
          ]),
          // Actions
          h("div", { class: "flex items-center space-x-2 ml-4" }, [
            // Status icon
            file.status === "success" &&
              h(
                "svg",
                {
                  class: "w-5 h-5 text-green-500",
                  fill: "currentColor",
                  viewBox: "0 0 20 20",
                  "aria-label": "Success",
                },
                [
                  h("path", {
                    "fill-rule": "evenodd",
                    d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
                    "clip-rule": "evenodd",
                  }),
                ]
              ),
            file.status === "error" &&
              h(
                "svg",
                {
                  class: "w-5 h-5 text-red-500",
                  fill: "currentColor",
                  viewBox: "0 0 20 20",
                  "aria-label": "Error",
                },
                [
                  h("path", {
                    "fill-rule": "evenodd",
                    d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
                    "clip-rule": "evenodd",
                  }),
                ]
              ),
            file.status === "uploading" &&
              h(
                "svg",
                {
                  class: "w-5 h-5 text-blue-500 animate-spin",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  "aria-label": "Uploading",
                },
                [
                  h("circle", {
                    class: "opacity-25",
                    cx: "12",
                    cy: "12",
                    r: "10",
                    stroke: "currentColor",
                    "stroke-width": "4",
                  }),
                  h("path", {
                    class: "opacity-75",
                    fill: "currentColor",
                    d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z",
                  }),
                ]
              ),
            // Remove button
            h(
              "button",
              {
                type: "button",
                class: "text-gray-400 hover:text-red-500 transition-colors",
                onClick: () => handleRemove(file),
                "aria-label": `Remove ${file.name}`,
              },
              [
                h(
                  "svg",
                  {
                    class: "w-5 h-5",
                    fill: "currentColor",
                    viewBox: "0 0 20 20",
                    "aria-hidden": "true",
                  },
                  [
                    h("path", {
                      "fill-rule": "evenodd",
                      d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
                      "clip-rule": "evenodd",
                    }),
                  ]
                ),
              ]
            ),
          ]),
        ]
      );
    };

    const renderPictureCard = (file: UploadFile) => {
      const imageUrl =
        file.url || (file.file ? URL.createObjectURL(file.file) : "");

      return h(
        "div",
        {
          class: getPictureCardClasses(file.status),
          key: file.uid,
        },
        [
          // Image preview
          imageUrl &&
            h("img", {
              src: imageUrl,
              alt: file.name,
              class: "w-full h-full object-cover",
            }),
          // Overlay
          h(
            "div",
            {
              class:
                "absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all flex items-center justify-center space-x-2 opacity-0 hover:opacity-100",
            },
            [
              // Preview button
              h(
                "button",
                {
                  type: "button",
                  class: "text-white hover:text-blue-200 transition-colors",
                  onClick: () => handlePreview(file),
                  "aria-label": `Preview ${file.name}`,
                },
                [
                  h(
                    "svg",
                    {
                      class: "w-6 h-6",
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24",
                      "aria-hidden": "true",
                    },
                    [
                      h("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z",
                      }),
                      h("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
                      }),
                    ]
                  ),
                ]
              ),
              // Remove button
              h(
                "button",
                {
                  type: "button",
                  class: "text-white hover:text-red-200 transition-colors",
                  onClick: () => handleRemove(file),
                  "aria-label": `Remove ${file.name}`,
                },
                [
                  h(
                    "svg",
                    {
                      class: "w-6 h-6",
                      fill: "currentColor",
                      viewBox: "0 0 20 20",
                      "aria-hidden": "true",
                    },
                    [
                      h("path", {
                        "fill-rule": "evenodd",
                        d: "M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z",
                        "clip-rule": "evenodd",
                      }),
                    ]
                  ),
                ]
              ),
            ]
          ),
          // Status indicator
          file.status === "uploading" &&
            h(
              "div",
              {
                class:
                  "absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center",
              },
              [
                h(
                  "svg",
                  {
                    class: "w-8 h-8 text-blue-500 animate-spin",
                    fill: "none",
                    viewBox: "0 0 24 24",
                  },
                  [
                    h("circle", {
                      class: "opacity-25",
                      cx: "12",
                      cy: "12",
                      r: "10",
                      stroke: "currentColor",
                      "stroke-width": "4",
                    }),
                    h("path", {
                      class: "opacity-75",
                      fill: "currentColor",
                      d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z",
                    }),
                  ]
                ),
              ]
            ),
        ]
      );
    };

    return () => {
      return h(
        "div",
        {
          ...attrs,
          class: classNames(
            "tiger-upload",
            props.className,
            coerceClassValue(attrsRecord.class)
          ),
          style: mergeStyleValues(attrsRecord.style, props.style),
        },
        [renderInput(), renderUploadButton(), renderFileList()]
      );
    };
  },
});

export default Upload;
