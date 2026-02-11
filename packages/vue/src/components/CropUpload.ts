import { defineComponent, h, ref, computed, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  cropUploadTriggerClasses,
  cropUploadTriggerDisabledClasses,
  uploadPlusIconPath,
  modalHeaderClasses,
  modalTitleClasses,
  modalCloseButtonClasses,
  modalBodyClasses,
  modalFooterClasses,
  closeIconViewBox,
  closeIconPathD,
  closeIconPathStrokeLinecap,
  closeIconPathStrokeLinejoin,
  closeIconPathStrokeWidth,
  type ImageCropperProps as CoreImageCropperProps,
  type CropResult
} from '@expcat/tigercat-core'
import { Modal } from './Modal'
import { ImageCropper } from './ImageCropper'
import { Button } from './Button'

export interface VueCropUploadProps {
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
    accept: { type: String, default: 'image/*' },
    disabled: { type: Boolean, default: false },
    maxSize: { type: Number, default: undefined },
    cropperProps: {
      type: Object as PropType<Partial<Omit<CoreImageCropperProps, 'src'>>>,
      default: undefined
    },
    modalTitle: { type: String, default: '裁剪图片' },
    modalWidth: { type: Number, default: 520 },
    className: { type: String, default: undefined },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['crop-complete', 'error'],
  setup(props, { slots, emit, attrs }) {
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

      // Validate max size
      if (props.maxSize && file.size > props.maxSize) {
        emit('error', new Error(`File size exceeds maximum of ${props.maxSize} bytes`))
        input.value = ''
        return
      }

      // Read file as data URL
      const reader = new FileReader()
      reader.onload = (ev) => {
        imageSrc.value = ev.target?.result as string
        modalVisible.value = true
      }
      reader.readAsDataURL(file)

      // Reset input so same file can be selected again
      input.value = ''
    }

    const handleConfirm = async () => {
      if (!cropperRef.value) return
      cropping.value = true
      try {
        const result: CropResult = await (
          cropperRef.value as unknown as { getCropResult: () => Promise<CropResult> }
        ).getCropResult()
        emit('crop-complete', result)
        modalVisible.value = false
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
              'aria-label': 'Select image to crop and upload',
              'aria-disabled': props.disabled ? 'true' : undefined,
              onKeydown: (e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
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
              'aria-label': 'Select image to crop and upload',
              'aria-disabled': props.disabled ? 'true' : undefined,
              onKeydown: (e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
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
              h('span', null, '选择图片')
            ]
          )

      // Crop modal
      const modal = h(
        Modal,
        {
          visible: modalVisible.value,
          size: 'lg',
          title: props.modalTitle,
          closable: true,
          maskClosable: false,
          showDefaultFooter: false,
          'onUpdate:visible': (val: boolean) => {
            if (!val) handleCancel()
          }
        },
        {
          default: () =>
            imageSrc.value
              ? h(ImageCropper, {
                  ref: cropperRef,
                  src: imageSrc.value,
                  ...props.cropperProps
                })
              : null,
          footer: ({ cancel }: { cancel: () => void }) =>
            h('div', { class: modalFooterClasses }, [
              h(Button, { variant: 'secondary', onClick: handleCancel }, { default: () => '取消' }),
              h(
                Button,
                { onClick: handleConfirm, loading: cropping.value },
                { default: () => '确认裁剪' }
              )
            ])
        }
      )

      return h('div', { class: 'tiger-crop-upload inline-block' }, [fileInput, trigger, modal])
    }
  }
})

export default CropUpload
