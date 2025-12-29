import { defineComponent, ref, computed, h, PropType } from 'vue'
import {
  type UploadFile,
  type UploadListType,
  type UploadRequestOptions,
  fileToUploadFile,
  validateFileType,
  validateFileSize,
  formatFileSize,
  getUploadButtonClasses,
  getDragAreaClasses,
  getFileListItemClasses,
  getPictureCardClasses,
} from '@tigercat/core'

export const Upload = defineComponent({
  name: 'TigerUpload',
  props: {
    /**
     * Accepted file types
     */
    accept: {
      type: String,
      default: undefined,
    },
    /**
     * Whether to allow multiple file selection
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
      default: undefined,
    },
    /**
     * Maximum file size in bytes
     */
    maxSize: {
      type: Number,
      default: undefined,
    },
    /**
     * Whether the upload is disabled
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether to enable drag and drop
     */
    drag: {
      type: Boolean,
      default: false,
    },
    /**
     * List type for displaying files
     */
    listType: {
      type: String as PropType<UploadListType>,
      default: 'text',
    },
    /**
     * List of uploaded files (v-model:file-list)
     */
    fileList: {
      type: Array as PropType<UploadFile[]>,
      default: () => [],
    },
    /**
     * Whether to show the file list
     */
    showFileList: {
      type: Boolean,
      default: true,
    },
    /**
     * Whether to auto upload when file is selected
     */
    autoUpload: {
      type: Boolean,
      default: true,
    },
    /**
     * Custom upload request
     */
    customRequest: {
      type: Function as PropType<(options: UploadRequestOptions) => void>,
      default: undefined,
    },
    /**
     * Before upload callback
     */
    beforeUpload: {
      type: Function as PropType<(file: File) => boolean | Promise<boolean>>,
      default: undefined,
    },
  },
  emits: [
    'update:file-list',
    'change',
    'remove',
    'preview',
    'progress',
    'success',
    'error',
    'exceed',
  ],
  setup(props, { emit, slots }) {
    const inputRef = ref<HTMLInputElement | null>(null)
    const isDragging = ref(false)
    const internalFileList = ref<UploadFile[]>([...props.fileList])

    // Sync internal file list with prop
    const fileListComputed = computed({
      get: () => props.fileList,
      set: (value) => {
        internalFileList.value = value
        emit('update:file-list', value)
      },
    })

    const handleClick = () => {
      if (props.disabled) return
      inputRef.value?.click()
    }

    const handleFileChange = async (event: Event) => {
      const target = event.target as HTMLInputElement
      const files = Array.from(target.files || [])
      await processFiles(files)
      // Reset input value to allow selecting the same file again
      if (target) {
        target.value = ''
      }
    }

    const processFiles = async (files: File[]) => {
      if (files.length === 0) return

      // Check limit
      const currentCount = fileListComputed.value.length
      const totalCount = currentCount + files.length

      if (props.limit && totalCount > props.limit) {
        const remainingSlots = props.limit - currentCount
        const acceptedFiles = files.slice(0, remainingSlots)
        const rejectedFiles = files.slice(remainingSlots)

        if (rejectedFiles.length > 0) {
          emit('exceed', rejectedFiles, fileListComputed.value)
        }

        files = acceptedFiles
      }

      for (const file of files) {
        // Validate file type
        if (!validateFileType(file, props.accept)) {
          console.warn(`File ${file.name} type is not accepted`)
          continue
        }

        // Validate file size
        if (!validateFileSize(file, props.maxSize)) {
          console.warn(`File ${file.name} exceeds maximum size`)
          continue
        }

        // Before upload hook
        if (props.beforeUpload) {
          try {
            const result = await props.beforeUpload(file)
            if (result === false) {
              continue
            }
          } catch (error) {
            console.error('beforeUpload error:', error)
            continue
          }
        }

        const uploadFile = fileToUploadFile(file)
        
        // Add to file list
        const newFileList = [...fileListComputed.value, uploadFile]
        fileListComputed.value = newFileList
        emit('change', uploadFile, newFileList)

        // Auto upload if enabled
        if (props.autoUpload) {
          uploadFile.status = 'uploading'
          if (props.customRequest) {
            props.customRequest({
              file,
              onProgress: (progress: number) => {
                uploadFile.progress = progress
                emit('progress', progress, uploadFile)
              },
              onSuccess: (response: unknown) => {
                uploadFile.status = 'success'
                emit('success', response, uploadFile)
              },
              onError: (error: Error) => {
                uploadFile.status = 'error'
                uploadFile.error = error.message
                emit('error', error, uploadFile)
              },
            })
          } else {
            // Simulate upload for demo purposes
            uploadFile.status = 'success'
          }
        }
      }
    }

    const handleRemove = (file: UploadFile) => {
      const newFileList = fileListComputed.value.filter((f) => f.uid !== file.uid)
      fileListComputed.value = newFileList
      emit('remove', file, newFileList)
    }

    const handlePreview = (file: UploadFile) => {
      emit('preview', file)
    }

    const handleDragOver = (event: DragEvent) => {
      if (props.disabled) return
      event.preventDefault()
      isDragging.value = true
    }

    const handleDragLeave = (event: DragEvent) => {
      if (props.disabled) return
      event.preventDefault()
      isDragging.value = false
    }

    const handleDrop = async (event: DragEvent) => {
      if (props.disabled) return
      event.preventDefault()
      isDragging.value = false

      const files = Array.from(event.dataTransfer?.files || [])
      await processFiles(files)
    }

    const renderInput = () => {
      return h('input', {
        ref: inputRef,
        type: 'file',
        accept: props.accept,
        multiple: props.multiple,
        disabled: props.disabled,
        style: { display: 'none' },
        onChange: handleFileChange,
        'aria-hidden': 'true',
      })
    }

    const renderUploadButton = () => {
      if (props.drag) {
        return h(
          'div',
          {
            class: getDragAreaClasses(isDragging.value, props.disabled),
            onClick: handleClick,
            onDragover: handleDragOver,
            onDragleave: handleDragLeave,
            onDrop: handleDrop,
            role: 'button',
            tabindex: props.disabled ? -1 : 0,
            'aria-disabled': props.disabled,
            'aria-label': 'Upload file by clicking or dragging',
          },
          [
            h(
              'svg',
              {
                class: 'w-12 h-12 mb-3 text-gray-400',
                fill: 'none',
                stroke: 'currentColor',
                viewBox: '0 0 24 24',
                'aria-hidden': 'true',
              },
              [
                h('path', {
                  'stroke-linecap': 'round',
                  'stroke-linejoin': 'round',
                  'stroke-width': '2',
                  d: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
                }),
              ]
            ),
            h('p', { class: 'mb-2 text-sm' }, [
              h('span', { class: 'font-semibold' }, 'Click to upload'),
              ' or drag and drop',
            ]),
            props.accept && h('p', { class: 'text-xs text-gray-500' }, `Accepted: ${props.accept}`),
            props.maxSize && h('p', { class: 'text-xs text-gray-500' }, `Max size: ${formatFileSize(props.maxSize)}`),
          ]
        )
      }

      return h(
        'button',
        {
          type: 'button',
          class: getUploadButtonClasses(props.drag, props.disabled),
          onClick: handleClick,
          disabled: props.disabled,
          'aria-label': 'Upload file',
        },
        slots.default ? slots.default() : 'Select File'
      )
    }

    const renderFileList = () => {
      if (!props.showFileList || fileListComputed.value.length === 0) {
        return null
      }

      if (props.listType === 'picture-card') {
        return h(
          'div',
          { class: 'flex flex-wrap gap-2 mt-4' },
          fileListComputed.value.map((file) => renderPictureCard(file))
        )
      }

      return h(
        'ul',
        { class: 'mt-4 space-y-2', role: 'list', 'aria-label': 'Uploaded files' },
        fileListComputed.value.map((file) => renderFileItem(file))
      )
    }

    const renderFileItem = (file: UploadFile) => {
      return h(
        'li',
        {
          class: getFileListItemClasses(file.status),
          key: file.uid,
        },
        [
          h('div', { class: 'flex items-center flex-1 min-w-0' }, [
            // File icon
            h(
              'svg',
              {
                class: 'w-5 h-5 mr-2 flex-shrink-0',
                fill: 'none',
                stroke: 'currentColor',
                viewBox: '0 0 24 24',
                'aria-hidden': 'true',
              },
              [
                h('path', {
                  'stroke-linecap': 'round',
                  'stroke-linejoin': 'round',
                  'stroke-width': '2',
                  d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                }),
              ]
            ),
            // File name and size
            h('div', { class: 'flex-1 min-w-0' }, [
              h(
                'p',
                { class: 'text-sm font-medium truncate' },
                file.name
              ),
              file.size && h(
                'p',
                { class: 'text-xs text-gray-500' },
                formatFileSize(file.size)
              ),
            ]),
          ]),
          // Actions
          h('div', { class: 'flex items-center space-x-2 ml-4' }, [
            // Status icon
            file.status === 'success' && h(
              'svg',
              {
                class: 'w-5 h-5 text-green-500',
                fill: 'currentColor',
                viewBox: '0 0 20 20',
                'aria-label': 'Success',
              },
              [
                h('path', {
                  'fill-rule': 'evenodd',
                  d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
                  'clip-rule': 'evenodd',
                }),
              ]
            ),
            file.status === 'error' && h(
              'svg',
              {
                class: 'w-5 h-5 text-red-500',
                fill: 'currentColor',
                viewBox: '0 0 20 20',
                'aria-label': 'Error',
              },
              [
                h('path', {
                  'fill-rule': 'evenodd',
                  d: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z',
                  'clip-rule': 'evenodd',
                }),
              ]
            ),
            file.status === 'uploading' && h(
              'svg',
              {
                class: 'w-5 h-5 text-blue-500 animate-spin',
                fill: 'none',
                viewBox: '0 0 24 24',
                'aria-label': 'Uploading',
              },
              [
                h('circle', {
                  class: 'opacity-25',
                  cx: '12',
                  cy: '12',
                  r: '10',
                  stroke: 'currentColor',
                  'stroke-width': '4',
                }),
                h('path', {
                  class: 'opacity-75',
                  fill: 'currentColor',
                  d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
                }),
              ]
            ),
            // Remove button
            h(
              'button',
              {
                type: 'button',
                class: 'text-gray-400 hover:text-red-500 transition-colors',
                onClick: () => handleRemove(file),
                'aria-label': `Remove ${file.name}`,
              },
              [
                h(
                  'svg',
                  {
                    class: 'w-5 h-5',
                    fill: 'currentColor',
                    viewBox: '0 0 20 20',
                    'aria-hidden': 'true',
                  },
                  [
                    h('path', {
                      'fill-rule': 'evenodd',
                      d: 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z',
                      'clip-rule': 'evenodd',
                    }),
                  ]
                ),
              ]
            ),
          ]),
        ]
      )
    }

    const renderPictureCard = (file: UploadFile) => {
      const imageUrl = file.url || (file.file ? URL.createObjectURL(file.file) : '')

      return h(
        'div',
        {
          class: getPictureCardClasses(file.status),
          key: file.uid,
        },
        [
          // Image preview
          imageUrl && h('img', {
            src: imageUrl,
            alt: file.name,
            class: 'w-full h-full object-cover',
          }),
          // Overlay
          h(
            'div',
            {
              class: 'absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all flex items-center justify-center space-x-2 opacity-0 hover:opacity-100',
            },
            [
              // Preview button
              h(
                'button',
                {
                  type: 'button',
                  class: 'text-white hover:text-blue-200 transition-colors',
                  onClick: () => handlePreview(file),
                  'aria-label': `Preview ${file.name}`,
                },
                [
                  h(
                    'svg',
                    {
                      class: 'w-6 h-6',
                      fill: 'none',
                      stroke: 'currentColor',
                      viewBox: '0 0 24 24',
                      'aria-hidden': 'true',
                    },
                    [
                      h('path', {
                        'stroke-linecap': 'round',
                        'stroke-linejoin': 'round',
                        'stroke-width': '2',
                        d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
                      }),
                      h('path', {
                        'stroke-linecap': 'round',
                        'stroke-linejoin': 'round',
                        'stroke-width': '2',
                        d: 'M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
                      }),
                    ]
                  ),
                ]
              ),
              // Remove button
              h(
                'button',
                {
                  type: 'button',
                  class: 'text-white hover:text-red-200 transition-colors',
                  onClick: () => handleRemove(file),
                  'aria-label': `Remove ${file.name}`,
                },
                [
                  h(
                    'svg',
                    {
                      class: 'w-6 h-6',
                      fill: 'currentColor',
                      viewBox: '0 0 20 20',
                      'aria-hidden': 'true',
                    },
                    [
                      h('path', {
                        'fill-rule': 'evenodd',
                        d: 'M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z',
                        'clip-rule': 'evenodd',
                      }),
                    ]
                  ),
                ]
              ),
            ]
          ),
          // Status indicator
          file.status === 'uploading' && h(
            'div',
            {
              class: 'absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center',
            },
            [
              h(
                'svg',
                {
                  class: 'w-8 h-8 text-blue-500 animate-spin',
                  fill: 'none',
                  viewBox: '0 0 24 24',
                },
                [
                  h('circle', {
                    class: 'opacity-25',
                    cx: '12',
                    cy: '12',
                    r: '10',
                    stroke: 'currentColor',
                    'stroke-width': '4',
                  }),
                  h('path', {
                    class: 'opacity-75',
                    fill: 'currentColor',
                    d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
                  }),
                ]
              ),
            ]
          ),
        ]
      )
    }

    return () => {
      return h(
        'div',
        {
          class: 'tiger-upload',
        },
        [
          renderInput(),
          renderUploadButton(),
          renderFileList(),
        ]
      )
    }
  },
})

export default Upload
