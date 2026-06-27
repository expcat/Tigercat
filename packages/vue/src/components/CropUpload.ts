import { defineComponent, h, ref, computed, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  cropUploadTriggerClasses,
  cropUploadTriggerDisabledClasses,
  uploadPlusIconPath,
  modalFooterClasses,
  validateUploadFile,
  readFileAsDataUrl,
  getCropperResult,
  isActivationKey,
  getImageEditorLabels,
  mergeTigerLocale,
  type ImageCropperProps as CoreImageCropperProps,
  type CropResult,
  type TigerLocale
} from '@expcat/tigercat-core'
import { Modal } from './Modal'
import { ImageCropper } from './ImageCropper'
import { Button } from './Button'
import { useTigerConfig } from './ConfigProvider'

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

export const CropUpload = defineComponent({
  name: 'TigerCropUpload',
  inheritAttrs: false,
  props: {
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
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
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['crop-complete', 'error'],
  setup(props, { slots, emit, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getImageEditorLabels(mergedLocale.value))
    const fileInputRef = ref<HTMLInputElement | null>(null)
    const modalVisible = ref(false)
    const imageSrc = ref('')
    const cropperRef = ref<InstanceType<typeof ImageCropper> | null>(null)
    const cropping = ref(false)

    const handleTriggerClick = () => {
      if (props.disabled) return
      fileInputRef.value?.click()
    }

    const handleFileChange = (e: Event) => {
      const input = e.target as HTMLInputElement
      const file = input.files?.[0]
      if (!file) return

      const sizeError = validateUploadFile(file, props.maxSize)
      if (sizeError) {
        emit('error', sizeError)
        input.value = ''
        return
      }

      readFileAsDataUrl(file)
        .then((url) => {
          imageSrc.value = url
          modalVisible.value = true
        })
        .catch((err) => emit('error', err))

      // Reset input so same file can be selected again
      input.value = ''
    }

    const handleConfirm = async () => {
      if (!cropperRef.value) return
      cropping.value = true
      try {
        const result = await getCropperResult(
          cropperRef.value as unknown as { getCropResult: () => Promise<CropResult> }
        )
        if (result) {
          emit('crop-complete', result)
          modalVisible.value = false
        }
      } catch (err) {
        emit('error', err)
      } finally {
        cropping.value = false
      }
    }

    const handleCancel = () => {
      modalVisible.value = false
      imageSrc.value = ''
    }

    const triggerClasses = computed(() =>
      classNames(
        props.disabled ? cropUploadTriggerDisabledClasses : cropUploadTriggerClasses,
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    const triggerStyle = computed(() =>
      mergeStyleValues((attrs as Record<string, unknown>).style, props.style)
    )

    return () => {
      const forwardedAttrs = Object.fromEntries(
        Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style')
      )

      // Hidden file input
      const fileInput = h('input', {
        ref: fileInputRef,
        type: 'file',
        accept: props.accept,
        style: { display: 'none' },
        onChange: handleFileChange
      })

      // Trigger button/slot
      const trigger = slots.default
        ? h(
            'div',
            {
              ...forwardedAttrs,
              class: triggerClasses.value,
              style: triggerStyle.value,
              onClick: handleTriggerClick,
              role: 'button',
              tabindex: props.disabled ? -1 : 0,
              'aria-label': labels.value.selectImageAriaLabel,
              'aria-disabled': props.disabled ? 'true' : undefined,
              onKeydown: (e: KeyboardEvent) => {
                if (isActivationKey(e)) {
                  e.preventDefault()
                  handleTriggerClick()
                }
              }
            },
            slots.default()
          )
        : h(
            'div',
            {
              ...forwardedAttrs,
              class: triggerClasses.value,
              style: triggerStyle.value,
              onClick: handleTriggerClick,
              role: 'button',
              tabindex: props.disabled ? -1 : 0,
              'aria-label': labels.value.selectImageAriaLabel,
              'aria-disabled': props.disabled ? 'true' : undefined,
              onKeydown: (e: KeyboardEvent) => {
                if (isActivationKey(e)) {
                  e.preventDefault()
                  handleTriggerClick()
                }
              }
            },
            [
              h(
                'svg',
                {
                  class: 'w-5 h-5',
                  xmlns: 'http://www.w3.org/2000/svg',
                  fill: 'none',
                  viewBox: '0 0 24 24',
                  stroke: 'currentColor'
                },
                [
                  h('path', {
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                    'stroke-width': '2',
                    d: uploadPlusIconPath
                  })
                ]
              ),
              h('span', null, labels.value.selectImageText)
            ]
          )

      // Crop modal
      const modal = h(
        Modal,
        {
          open: modalVisible.value,
          size: 'lg',
          width: props.modalWidth,
          title: props.modalTitle ?? labels.value.cropModalTitle,
          closable: true,
          maskClosable: false,
          showDefaultFooter: false,
          className: 'tiger-crop-upload-modal',
          'onUpdate:open': (val: boolean) => {
            if (!val) handleCancel()
          }
        },
        {
          default: () =>
            imageSrc.value
              ? h(ImageCropper, {
                  ref: cropperRef,
                  src: imageSrc.value,
                  locale: props.locale,
                  ...props.cropperProps
                })
              : null,
          footer: ({ cancel: _cancel }: { cancel: () => void }) =>
            h('div', { class: modalFooterClasses }, [
              h(
                Button,
                { variant: 'secondary', onClick: handleCancel },
                { default: () => labels.value.cropCancelText }
              ),
              h(
                Button,
                { onClick: handleConfirm, loading: cropping.value },
                { default: () => labels.value.cropConfirmText }
              )
            ])
        }
      )

      return h('div', { class: 'tiger-crop-upload inline-block' }, [fileInput, trigger, modal])
    }
  }
})

export default CropUpload
