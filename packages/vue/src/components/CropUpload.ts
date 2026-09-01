import { defineComponent, h, ref, computed, onBeforeUnmount, inject, useId, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  createCropUploadSession,
  formatBytes,
  getCropUploadTriggerClasses,
  getImageEditorLabels,
  handleUploadDragLeave,
  handleUploadDragOver,
  handleUploadDrop,
  interpolateUploadLabel,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  withCropFile,
  type ImageCropperProps as CoreImageCropperProps,
  type TigerLocale
} from '@expcat/tigercat-core'
import { Modal } from './Modal'
import { ImageCropper, type ImageCropperRef } from './ImageCropper'
import { Button } from './Button'
import { Icon } from './Icon'
import { useTigerConfig } from './ConfigProvider'
import { FORM_ITEM_CONTROL_INJECTION_KEY, type VueFormItemControlContext } from './FormItemContext'

export interface VueCropUploadProps {
  locale?: Partial<TigerLocale>
  accept?: string
  disabled?: boolean
  maxSize?: number
  cropperProps?: Partial<Omit<CoreImageCropperProps, 'src'>>
  modalTitle?: string
  modalWidth?: number
  className?: string
  style?: Record<string, string | number>
}

export type CropUploadProps = VueCropUploadProps

export const CropUpload = defineComponent({
  name: 'TigerCropUpload',
  inheritAttrs: false,
  props: {
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    accept: { type: String, default: 'image/*' },
    disabled: { type: Boolean, default: false },
    maxSize: { type: Number, default: undefined },
    cropperProps: {
      type: Object as PropType<Partial<Omit<CoreImageCropperProps, 'src'>>>,
      default: undefined
    },
    modalTitle: { type: String, default: undefined },
    modalWidth: { type: Number, default: 520 },
    className: { type: String, default: undefined },
    style: { type: Object as PropType<Record<string, string | number>>, default: undefined }
  },
  emits: ['crop-complete', 'error'],
  setup(props, { slots, emit, attrs, expose }) {
    const config = useTigerConfig()
    const formItemControl = inject<VueFormItemControlContext | null>(
      FORM_ITEM_CONTROL_INJECTION_KEY,
      null
    )
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getImageEditorLabels(mergedLocale.value))
    const effectiveDisabled = computed(
      () => props.disabled || (formItemControl?.disabled.value ?? false)
    )
    const autoId = useId()
    const triggerId = computed(() => formItemControl?.id.value ?? `tiger-crop-upload-${autoId}`)
    const inputId = computed(() => `${triggerId.value}-input`)
    const fileInputRef = ref<HTMLInputElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)
    const cropperRef = ref<ImageCropperRef | null>(null)
    const isDragging = ref(false)
    const sessionState = ref({
      generation: 0,
      modalOpen: false,
      imageSrc: '',
      originalFile: null as File | null,
      cropperReady: false,
      cropping: false
    })

    const session = createCropUploadSession({
      getAccept: () => props.accept,
      getMaxSize: () => props.maxSize,
      getSizeError: (limit) =>
        interpolateUploadLabel(labels.value.fileTooLargeText, { maxSize: formatBytes(limit) }),
      getTypeError: () => labels.value.fileTypeRejectedText,
      onState: (state) => {
        sessionState.value = state
      },
      onError: (error) => emit('error', error)
    })

    onBeforeUnmount(() => session.dispose())

    expose({
      focus: () => triggerRef.value?.focus?.()
    })

    const handleFiles = (file?: File | null) => {
      if (effectiveDisabled.value) return
      session.selectFile(file)
      if (fileInputRef.value) fileInputRef.value.value = ''
    }

    const handleConfirm = async () => {
      if (!session.beginCrop()) return
      try {
        const raw = await cropperRef.value?.getCropResult()
        if (!raw) {
          session.endCrop()
          return
        }
        const originalName = session.getState().originalFile?.name ?? raw.file.name
        const result = withCropFile(raw, originalName)
        emit('crop-complete', result)
        formItemControl?.onChange(result.file)
        session.close()
      } catch (error) {
        emit('error', error)
        session.endCrop()
      }
    }

    const handleCancel = () => session.close()

    return () => {
      const forwarded = Object.fromEntries(
        Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')
      )
      const cropper = props.cropperProps ?? {}
      const { onReady: userReady, locale: cropperLocale, ...restCropper } = cropper

      const trigger = h(
        'label',
        {
          ...forwarded,
          ref: triggerRef,
          id: triggerId.value,
          for: effectiveDisabled.value ? undefined : inputId.value,
          class: getCropUploadTriggerClasses(
            effectiveDisabled.value,
            classNames(props.className, coerceClassValue((attrs as Record<string, unknown>).class))
          ),
          style: mergeStyleValues((attrs as Record<string, unknown>).style, props.style),
          'aria-disabled': effectiveDisabled.value || undefined,
          'aria-describedby': mergeAriaDescribedBy(
            typeof forwarded['aria-describedby'] === 'string'
              ? (forwarded['aria-describedby'] as string)
              : undefined,
            formItemControl?.describedBy.value
          ),
          'aria-label': slots.default ? undefined : labels.value.selectImageAriaLabel,
          onDragover: (event: DragEvent) => {
            const result = handleUploadDragOver(event, effectiveDisabled.value)
            if (result.handled) isDragging.value = result.isDragging
          },
          onDragleave: (event: DragEvent) => {
            const result = handleUploadDragLeave(
              event,
              effectiveDisabled.value,
              event.currentTarget
            )
            if (result.handled) isDragging.value = result.isDragging
          },
          onDrop: (event: DragEvent) => {
            const result = handleUploadDrop(event, effectiveDisabled.value)
            if (!result.handled) return
            isDragging.value = false
            handleFiles(result.files[0])
          }
        },
        slots.default
          ? slots.default()
          : [
              h(Icon, { name: 'plus', class: 'w-5 h-5', 'aria-hidden': true }),
              h('span', null, labels.value.selectImageText)
            ]
      )

      return h('div', { class: 'tiger-crop-upload inline-block' }, [
        h('input', {
          ref: fileInputRef,
          id: inputId.value,
          type: 'file',
          accept: props.accept,
          disabled: effectiveDisabled.value,
          class: 'sr-only',
          tabindex: -1,
          onChange: (event: Event) => handleFiles((event.target as HTMLInputElement).files?.[0])
        }),
        trigger,
        h(
          Modal,
          {
            open: sessionState.value.modalOpen,
            width: props.modalWidth,
            title: props.modalTitle ?? labels.value.cropModalTitle,
            closable: true,
            maskClosable: false,
            destroyOnClose: true,
            onClose: handleCancel,
            'onUpdate:open': (open: boolean) => {
              if (!open) handleCancel()
            }
          },
          {
            default: () =>
              sessionState.value.imageSrc
                ? h(ImageCropper, {
                    ref: cropperRef,
                    src: sessionState.value.imageSrc,
                    locale: props.locale ?? cropperLocale,
                    ...restCropper,
                    onReady: () => {
                      session.markReady()
                      userReady?.()
                    },
                    onError: (error: Error) => session.markLoadError(error)
                  })
                : null,
            footer: () =>
              h('div', { class: 'flex items-center justify-end gap-3' }, [
                h(
                  Button,
                  { variant: 'secondary', onClick: handleCancel },
                  { default: () => labels.value.cropCancelText }
                ),
                h(
                  Button,
                  {
                    onClick: handleConfirm,
                    loading: sessionState.value.cropping,
                    disabled: !sessionState.value.cropperReady
                  },
                  { default: () => labels.value.cropConfirmText }
                )
              ])
          }
        )
      ])
    }
  }
})

export default CropUpload
