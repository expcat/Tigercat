import {
  defineComponent,
  ref,
  computed,
  watch,
  h,
  onBeforeUnmount,
  inject,
  useId,
  PropType
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  getUploadLabels,
  interpolateUploadLabel,
  isImageUploadFile,
  formatFileSize,
  getDragAreaClasses,
  getFileListItemClasses,
  getPictureCardClasses,
  getUploadStatusIconClasses,
  handleUploadDragOver,
  handleUploadDragLeave,
  handleUploadDrop,
  readUploadDropFiles,
  createUploadController,
  createUploadPreviewUrlCache,
  runShakeAnimation,
  uploadFileInputClasses,
  uploadIconActionClasses,
  uploadItemActionsClasses,
  uploadListClasses,
  uploadPictureImageWrapClasses,
  uploadPictureListClasses,
  uploadPictureOverlayClasses,
  uploadProgressTrackClasses,
  uploadProgressValueClasses,
  type TigerLocale,
  type UploadFile,
  type UploadListType,
  type UploadRequestOptions,
  type UploadLabels,
  type UploadChunk,
  type UploadQueueItem,
  type UploadRejectedFile,
  type InputStatus
} from '@expcat/tigercat-core'

import { useTigerConfig } from './ConfigProvider'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'
import { Button } from './Button'
import { Icon } from './Icon'
import { ImagePreview } from './ImagePreview'

export interface VueUploadProps {
  accept?: string
  multiple?: boolean
  limit?: number
  maxSize?: number
  disabled?: boolean
  drag?: boolean
  listType?: UploadListType
  fileList?: UploadFile[]
  defaultFileList?: UploadFile[]
  name?: string
  status?: InputStatus
  action?: string
  method?: string
  headers?: Record<string, string>
  data?: Record<string, string | Blob>
  withCredentials?: boolean
  showFileList?: boolean
  autoUpload?: boolean
  queue?: boolean
  maxConcurrent?: number
  chunkSize?: number
  resumable?: boolean
  customRequest?: (options: UploadRequestOptions) => void | { abort?: () => void }
  beforeUpload?: (file: File) => boolean | Promise<boolean>
  onRemove?: (file: UploadFile, fileList: UploadFile[]) => void | boolean | Promise<void | boolean>
  className?: string
  style?: Record<string, string | number>
  locale?: Partial<TigerLocale>
  labels?: Partial<UploadLabels>
}

export type UploadProps = VueUploadProps

export const Upload = defineComponent({
  name: 'TigerUpload',
  inheritAttrs: false,
  props: {
    className: { type: String as PropType<string>, default: undefined },
    style: { type: Object as PropType<Record<string, string | number>>, default: undefined },
    accept: { type: String },
    multiple: { type: Boolean, default: false },
    limit: { type: Number },
    maxSize: { type: Number },
    disabled: { type: Boolean, default: false },
    drag: { type: Boolean, default: false },
    listType: { type: String as PropType<UploadListType>, default: 'text' as UploadListType },
    fileList: { type: Array as PropType<UploadFile[]>, default: undefined },
    defaultFileList: { type: Array as PropType<UploadFile[]>, default: undefined },
    name: { type: String, default: undefined },
    status: { type: String as PropType<InputStatus>, default: undefined },
    action: { type: String, default: undefined },
    method: { type: String, default: undefined },
    headers: { type: Object as PropType<Record<string, string>>, default: undefined },
    data: { type: Object as PropType<Record<string, string | Blob>>, default: undefined },
    withCredentials: { type: Boolean, default: false },
    showFileList: { type: Boolean, default: true },
    autoUpload: { type: Boolean, default: true },
    queue: { type: Boolean, default: false },
    maxConcurrent: { type: Number, default: 2 },
    chunkSize: { type: Number, default: undefined },
    resumable: { type: Boolean, default: false },
    customRequest: {
      type: Function as PropType<(options: UploadRequestOptions) => void | { abort?: () => void }>
    },
    beforeUpload: {
      type: Function as PropType<(file: File) => boolean | Promise<boolean>>
    },
    onRemove: {
      type: Function as PropType<
        (file: UploadFile, fileList: UploadFile[]) => void | boolean | Promise<void | boolean>
      >
    },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    labels: { type: Object as PropType<Partial<UploadLabels>>, default: undefined }
  },
  emits: {
    'update:file-list': (files: UploadFile[]) => Array.isArray(files),
    change: (_file: UploadFile, _fileList: UploadFile[]) => true,
    remove: (_file: UploadFile, _fileList: UploadFile[]) => true,
    preview: (_file: UploadFile) => true,
    progress: (progress: number, _file: UploadFile) => typeof progress === 'number',
    success: (_response: unknown, _file: UploadFile) => true,
    error: (error: Error, _file: UploadFile) => error instanceof Error,
    'chunk-progress': (_chunk: UploadChunk, progress: number, _file: UploadFile) =>
      typeof progress === 'number',
    'queue-change': (queue: UploadQueueItem[]) => Array.isArray(queue),
    exceed: (files: File[], fileList: UploadFile[]) =>
      Array.isArray(files) && Array.isArray(fileList),
    reject: (files: UploadRejectedFile[]) => Array.isArray(files)
  },
  setup(props, { emit, slots, attrs, expose }) {
    const inputRef = ref<HTMLInputElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const rootRef = ref<HTMLElement | null>(null)
    const isDragging = ref(false)
    const previewSrc = ref<string | null>(null)
    const previewUrls = createUploadPreviewUrlCache()

    const config = useTigerConfig()
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getUploadLabels(mergedLocale.value, props.labels))
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const status = computed<InputStatus>(
      () => props.status ?? formItemControl?.status.value ?? 'default'
    )
    const autoId = useId()
    const triggerId = computed(() => formItemControl?.id.value ?? `tiger-upload-${autoId}`)
    const inputId = computed(() => `${triggerId.value}-input`)
    const fieldName = computed(() => props.name ?? formItemControl?.name.value)
    const describedBy = computed(() =>
      mergeAriaDescribedBy(
        typeof (attrs as Record<string, unknown>)['aria-describedby'] === 'string'
          ? ((attrs as Record<string, unknown>)['aria-describedby'] as string)
          : undefined,
        formItemControl?.describedBy.value
      )
    )

    const isControlled = computed(() => props.fileList !== undefined)
    const workingList = ref<UploadFile[]>([...(props.fileList ?? props.defaultFileList ?? [])])
    const fileListValue = computed<UploadFile[]>(() =>
      isControlled.value ? (props.fileList ?? workingList.value) : workingList.value
    )

    watch(
      () => props.fileList,
      (value) => {
        if (value !== undefined) workingList.value = [...value]
      }
    )

    watch(fileListValue, (files) => previewUrls.sync(files), { deep: true, immediate: true })
    watch(
      () => [status.value, formItemControl?.shakeTrigger.value] as const,
      (current, previous) => {
        if (!previous) return
        if (current[0] === 'error') runShakeAnimation(rootRef.value)
      },
      { flush: 'post' }
    )

    onBeforeUnmount(() => {
      previewUrls.dispose()
      controller.dispose()
    })

    const setFileList = (value: UploadFile[], changed?: UploadFile) => {
      workingList.value = value
      emit('update:file-list', value)
      if (changed) emit('change', changed, value)
      formItemControl?.onChange(value)
    }

    const controller = createUploadController({
      host: {
        getFileList: () => workingList.value,
        setFileList
      },
      getConfig: () => ({
        accept: props.accept,
        limit: props.limit,
        maxSize: props.maxSize,
        autoUpload: props.autoUpload,
        queue: props.queue,
        maxConcurrent: props.maxConcurrent,
        chunkSize: props.chunkSize,
        resumable: props.resumable,
        action: props.action,
        name: fieldName.value,
        method: props.method,
        headers: props.headers,
        data: props.data,
        withCredentials: props.withCredentials,
        customRequest: props.customRequest,
        beforeUpload: props.beforeUpload
      }),
      callbacks: {
        onRemove: (file, list) => props.onRemove?.(file, list),
        onProgress: (progress, file) => emit('progress', progress, file),
        onSuccess: (response, file) => emit('success', response, file),
        onError: (error, file) => emit('error', error, file),
        onExceed: (files, list) => emit('exceed', files, list),
        onReject: (files) => emit('reject', files),
        onQueueChange: (queue) => emit('queue-change', queue),
        onChunkProgress: (chunk, progress, file) => emit('chunk-progress', chunk, progress, file)
      }
    })

    const openPicker = () => {
      if (effectiveDisabled.value) return
      inputRef.value?.click()
    }

    const handleFileChange = async (event: Event) => {
      event.stopPropagation()
      const target = event.target as HTMLInputElement
      await controller.processFiles(Array.from(target.files || []))
      target.value = ''
    }

    const handleRemove = async (file: UploadFile) => {
      if (effectiveDisabled.value) return
      const removed = await controller.remove(file)
      if (removed) emit('remove', file, fileListValue.value)
    }

    const handlePreview = (file: UploadFile) => {
      if (effectiveDisabled.value) return
      emit('preview', file)
      if (attrs.onPreview) return
      const url = previewUrls.get(file)
      if (url) previewSrc.value = url
    }

    const handleFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget as Node | null
      if (next && (event.currentTarget as Node).contains(next)) return
      formItemControl?.onBlur()
    }

    expose({
      focus: () => {
        const node = triggerRef.value as (HTMLElement & { $el?: HTMLElement }) | null
        if (!node) return
        if (typeof node.focus === 'function') node.focus()
        else node.$el?.focus?.()
      },
      submit: () => controller.submit(),
      abort: (uid?: string) => controller.abort(uid),
      retry: (file: UploadFile) => controller.retry(file)
    })

    const statusIcon = (fileStatus: UploadFile['status'], size: 'sm' | 'lg') => {
      if (fileStatus === 'success') {
        return h(Icon, {
          name: 'success',
          class: getUploadStatusIconClasses('success', size),
          role: 'img',
          'aria-label': labels.value.successAriaLabel
        })
      }
      if (fileStatus === 'error') {
        return h(Icon, {
          name: 'error',
          class: getUploadStatusIconClasses('error', size),
          role: 'img',
          'aria-label': labels.value.errorAriaLabel
        })
      }
      if (fileStatus === 'uploading') {
        return h(Icon, {
          name: 'refresh',
          class: getUploadStatusIconClasses('uploading', size, { spinning: true }),
          role: 'img',
          'aria-label': labels.value.uploadingAriaLabel
        })
      }
      return null
    }

    const progressBlock = (file: UploadFile, errorId?: string) => [
      file.status === 'uploading'
        ? h(
            'div',
            {
              class: uploadProgressTrackClasses,
              role: 'progressbar',
              'aria-valuemin': 0,
              'aria-valuemax': 100,
              'aria-valuenow': file.progress ?? 0
            },
            [
              h('div', {
                class: uploadProgressValueClasses,
                style: { width: `${file.progress ?? 0}%` }
              })
            ]
          )
        : null,
      file.status === 'error' && file.error
        ? h('p', { id: errorId, class: 'text-xs text-[var(--tiger-error,#dc2626)]' }, file.error)
        : null
    ]

    const actionButtons = (file: UploadFile, picture: boolean) => {
      const canPreview =
        Boolean(attrs.onPreview) || (isImageUploadFile(file) && Boolean(previewUrls.get(file)))
      const actionClass = picture
        ? 'text-[var(--tiger-on-primary,#ffffff)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))] rounded-sm'
        : uploadIconActionClasses
      return [
        canPreview
          ? h(
              'button',
              {
                type: 'button',
                class: actionClass,
                disabled: effectiveDisabled.value,
                tabindex: effectiveDisabled.value ? -1 : 0,
                onClick: () => handlePreview(file),
                'aria-label': interpolateUploadLabel(labels.value.previewFileAriaLabel, {
                  fileName: file.name
                })
              },
              [
                h(Icon, {
                  name: 'eye',
                  class: picture ? 'w-6 h-6' : 'w-5 h-5',
                  'aria-hidden': true
                })
              ]
            )
          : null,
        h(
          'button',
          {
            type: 'button',
            class: actionClass,
            disabled: effectiveDisabled.value,
            tabindex: effectiveDisabled.value ? -1 : 0,
            onClick: () => handleRemove(file),
            'aria-label': interpolateUploadLabel(labels.value.removeFileAriaLabel, {
              fileName: file.name
            })
          },
          [
            h(Icon, {
              name: picture ? 'trash' : 'close',
              class: picture ? 'w-6 h-6' : 'w-5 h-5',
              'aria-hidden': true
            })
          ]
        )
      ]
    }

    return () => {
      const forwarded = Object.fromEntries(
        Object.entries(attrs).filter(
          ([key]) => key !== 'class' && key !== 'style' && key !== 'onPreview'
        )
      )
      const triggerAria = {
        id: triggerId.value,
        'aria-invalid': status.value === 'error' ? true : undefined,
        'aria-required': formItemControl?.required.value ? true : undefined,
        'aria-describedby': describedBy.value,
        'aria-labelledby': formItemControl?.labelId.value,
        'aria-controls': inputId.value
      }

      const trigger = props.drag
        ? h(
            'div',
            {
              ...forwarded,
              ...triggerAria,
              ref: triggerRef,
              class: getDragAreaClasses(isDragging.value, effectiveDisabled.value),
              onClick: openPicker,
              onKeydown: (event: KeyboardEvent) => {
                if (effectiveDisabled.value) return
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  openPicker()
                }
              },
              onDragover: (event: DragEvent) => {
                const result = handleUploadDragOver(event, effectiveDisabled.value)
                if (!result.handled) return
                isDragging.value = result.isDragging
              },
              onDragleave: (event: DragEvent) => {
                const result = handleUploadDragLeave(
                  event,
                  effectiveDisabled.value,
                  event.currentTarget
                )
                if (!result.handled) return
                isDragging.value = result.isDragging
              },
              onDrop: async (event: DragEvent) => {
                const result = handleUploadDrop(event, effectiveDisabled.value)
                if (!result.handled) return
                isDragging.value = false
                const read = readUploadDropFiles(event.dataTransfer)
                if (read.rejectedDirectories.length > 0) {
                  emit(
                    'reject',
                    read.rejectedDirectories.map((file) => ({
                      file,
                      reason: 'directory' as const
                    }))
                  )
                }
                await controller.processFiles(read.files)
              },
              role: 'button',
              tabindex: effectiveDisabled.value ? -1 : 0,
              'aria-disabled': effectiveDisabled.value,
              'aria-label': slots.default ? undefined : labels.value.dragAreaAriaLabel
            },
            slots.default
              ? slots.default()
              : [
                  h(Icon, {
                    name: 'upload',
                    class: 'w-12 h-12 mb-3 text-[var(--tiger-text-muted,#9ca3af)]',
                    'aria-hidden': true
                  }),
                  h('p', { class: 'mb-2 text-sm' }, [
                    h('span', { class: 'font-semibold' }, labels.value.clickToUploadText),
                    ` ${labels.value.dragAndDropText}`
                  ]),
                  props.accept
                    ? h(
                        'p',
                        { class: 'text-xs text-[var(--tiger-text-muted,#6b7280)]' },
                        interpolateUploadLabel(labels.value.acceptInfoText, {
                          accept: props.accept
                        })
                      )
                    : null,
                  props.maxSize
                    ? h(
                        'p',
                        { class: 'text-xs text-[var(--tiger-text-muted,#6b7280)]' },
                        interpolateUploadLabel(labels.value.maxSizeInfoText, {
                          maxSize: formatFileSize(props.maxSize)
                        })
                      )
                    : null
                ]
          )
        : h(
            Button,
            {
              ...forwarded,
              ...triggerAria,
              ref: triggerRef,
              type: 'button',
              variant: 'outline',
              size: 'sm',
              disabled: effectiveDisabled.value,
              onClick: openPicker,
              'aria-label': slots.default ? undefined : labels.value.buttonAriaLabel
            },
            { default: () => (slots.default ? slots.default() : labels.value.selectFileText) }
          )

      const list =
        !props.showFileList || fileListValue.value.length === 0
          ? null
          : props.listType === 'picture-card'
            ? h(
                'div',
                { class: uploadPictureListClasses },
                fileListValue.value.map((file) => {
                  const imageUrl = previewUrls.get(file)
                  const errorId =
                    file.status === 'error' && file.error ? `${file.uid}-error` : undefined
                  return h('div', { class: getPictureCardClasses(file.status), key: file.uid }, [
                    h('div', { class: uploadPictureImageWrapClasses }, [
                      imageUrl
                        ? h('img', {
                            src: imageUrl,
                            alt: file.name,
                            class: 'w-full h-full object-cover'
                          })
                        : h(
                            'span',
                            {
                              class:
                                'flex h-full w-full items-center justify-center px-2 text-xs text-center text-[var(--tiger-text-muted,#6b7280)]'
                            },
                            file.name
                          )
                    ]),
                    h('div', { class: uploadPictureOverlayClasses }, actionButtons(file, true)),
                    file.status === 'uploading'
                      ? h(
                          'div',
                          {
                            class:
                              'absolute inset-0 flex flex-col items-center justify-center bg-[var(--tiger-surface,#ffffff)]/80'
                          },
                          [statusIcon('uploading', 'lg'), ...progressBlock(file)]
                        )
                      : null,
                    file.status === 'error' && file.error
                      ? h(
                          'p',
                          {
                            id: errorId,
                            class:
                              'absolute bottom-1 inset-x-1 text-[10px] text-[var(--tiger-error,#dc2626)] truncate'
                          },
                          file.error
                        )
                      : null
                  ])
                })
              )
            : h(
                'ul',
                {
                  class: uploadListClasses,
                  role: 'list',
                  'aria-label': labels.value.uploadedFilesAriaLabel
                },
                fileListValue.value.map((file) => {
                  const errorId =
                    file.status === 'error' && file.error ? `${file.uid}-error` : undefined
                  const thumb = props.listType === 'picture' ? previewUrls.get(file) : undefined
                  return h(
                    'li',
                    {
                      class: getFileListItemClasses(file.status),
                      key: file.uid,
                      'aria-describedby': errorId
                    },
                    [
                      h('div', { class: 'flex items-center flex-1 min-w-0 gap-2' }, [
                        props.listType === 'picture' && thumb
                          ? h('img', {
                              src: thumb,
                              alt: '',
                              class: 'w-10 h-10 rounded object-cover flex-shrink-0'
                            })
                          : h(Icon, {
                              name: 'document',
                              class: 'w-5 h-5 flex-shrink-0',
                              'aria-hidden': true
                            }),
                        h('div', { class: 'flex-1 min-w-0' }, [
                          h('p', { class: 'text-sm font-medium truncate' }, file.name),
                          file.size != null
                            ? h(
                                'p',
                                { class: 'text-xs text-[var(--tiger-text-muted,#6b7280)]' },
                                formatFileSize(file.size)
                              )
                            : null,
                          ...progressBlock(file, errorId)
                        ])
                      ]),
                      h('div', { class: uploadItemActionsClasses }, [
                        statusIcon(file.status, 'sm'),
                        ...actionButtons(file, false)
                      ])
                    ]
                  )
                })
              )

      return h(
        'div',
        {
          ref: rootRef,
          class: classNames(
            'tiger-upload',
            props.className,
            coerceClassValue((attrs as Record<string, unknown>).class)
          ),
          style: mergeStyleValues((attrs as Record<string, unknown>).style, props.style),
          onFocusout: handleFocusOut
        },
        [
          h('input', {
            ref: inputRef,
            id: inputId.value,
            type: 'file',
            accept: props.accept,
            multiple: props.multiple,
            disabled: effectiveDisabled.value,
            class: uploadFileInputClasses,
            onChange: handleFileChange,
            'aria-hidden': 'true',
            tabindex: -1
          }),
          fieldName.value
            ? fileListValue.value.map((file) =>
                h('input', {
                  key: file.uid,
                  type: 'hidden',
                  name: fieldName.value,
                  value: file.url ?? file.uid
                })
              )
            : null,
          trigger,
          list,
          previewSrc.value
            ? h(ImagePreview, {
                images: [previewSrc.value],
                open: true,
                'onUpdate:open': (open: boolean) => {
                  if (!open) previewSrc.value = null
                }
              })
            : null
        ]
      )
    }
  }
})

export default Upload
