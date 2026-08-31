import { defineComponent, h, ref, provide, onBeforeUnmount, type InjectionKey } from 'vue'
import {
  clampImageGroupPreviewIndex,
  coerceClassValue,
  getImageGroupClasses,
  getImageGroupItemIndex,
  getImageGroupSrcs,
  getImageLabels,
  registerImageGroupItem,
  resolveImageGroupName,
  unregisterImageGroupItem,
  type ImageGroupItem
} from '@expcat/tigercat-core'
import { ImagePreview } from './ImagePreview'
import { useTigerConfig } from './ConfigProvider'

export interface ImageGroupContext {
  preview: boolean
  register: (item: ImageGroupItem) => void
  unregister: (id: string) => void
  openPreview: (id: string) => void
}

export const IMAGE_GROUP_INJECTION_KEY: InjectionKey<ImageGroupContext> = Symbol('TigerImageGroup')

export interface VueImageGroupProps {
  preview?: boolean
  className?: string
}

export const ImageGroup = defineComponent({
  name: 'TigerImageGroup',
  inheritAttrs: false,
  props: {
    preview: { type: Boolean, default: true },
    className: { type: String, default: undefined }
  },
  emits: ['preview-open-change'],
  setup(props, { slots, emit, attrs }) {
    const config = useTigerConfig()
    const images = ref<ImageGroupItem[]>([])
    const previewVisible = ref(false)
    const previewIndex = ref(0)

    const context: ImageGroupContext = {
      get preview() {
        return props.preview
      },
      register(item: ImageGroupItem) {
        images.value = registerImageGroupItem(images.value, item).items
      },
      unregister(id: string) {
        images.value = unregisterImageGroupItem(images.value, id)
      },
      openPreview(id: string) {
        if (!props.preview) return
        const index = getImageGroupItemIndex(images.value, id)
        if (index < 0) return
        previewIndex.value = index
        previewVisible.value = true
        emit('preview-open-change', true)
      }
    }

    provide(IMAGE_GROUP_INJECTION_KEY, context)

    onBeforeUnmount(() => {
      images.value = []
    })

    return () => {
      const children = slots.default?.()
      const labels = getImageLabels(config.value.locale)
      const srcs = getImageGroupSrcs(images.value)
      const currentIndex = clampImageGroupPreviewIndex(previewIndex.value, srcs.length)
      const groupName = resolveImageGroupName({
        ariaLabel: attrs['aria-label'],
        ariaLabelledby: attrs['aria-labelledby'],
        localeLabel: labels.groupAriaLabel
      })

      const preview = props.preview
        ? h(ImagePreview, {
            open: previewVisible.value && srcs.length > 0,
            images: srcs,
            currentIndex,
            'onUpdate:open': (val: boolean) => {
              previewVisible.value = val
              if (!val) emit('preview-open-change', false)
            },
            'onUpdate:currentIndex': (val: number) => {
              previewIndex.value = val
            }
          })
        : null

      const restAttrs = { ...attrs }
      delete restAttrs.class
      delete restAttrs.className
      delete restAttrs['aria-label']
      delete restAttrs['aria-labelledby']

      return h(
        'div',
        {
          ...restAttrs,
          class: getImageGroupClasses(
            props.className,
            coerceClassValue(attrs.class),
            coerceClassValue(attrs.className)
          ),
          role: groupName.role,
          'aria-label': groupName['aria-label'],
          'aria-labelledby': groupName['aria-labelledby']
        },
        [children, preview]
      )
    }
  }
})

export default ImageGroup
