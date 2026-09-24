import { computed, defineComponent, h, ref, provide, onBeforeUnmount, watch, type InjectionKey } from 'vue'
import {
  clampImageGroupPreviewIndex,
  coerceClassValue,
  getImageGroupClasses,
  getImageGroupItemIndex,
  getImageGroupLightboxItems,
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
  open?: boolean
  currentIndex?: number
  className?: string
}

export const ImageGroup = defineComponent({
  name: 'TigerImageGroup',
  inheritAttrs: false,
  props: {
    preview: { type: Boolean, default: true },
    open: { type: Boolean, default: undefined },
    currentIndex: { type: Number, default: undefined },
    className: { type: String, default: undefined }
  },
  emits: ['preview-open-change', 'update:open', 'update:currentIndex'],
  setup(props, { slots, emit, attrs }) {
    const config = useTigerConfig()
    const images = ref<ImageGroupItem[]>([])
    const previewVisible = ref(false)
    const previewIndex = ref(0)
    const openIsControlled = computed(() => props.open !== undefined)
    const indexIsControlled = computed(() => props.currentIndex !== undefined)

    watch(
      () => props.currentIndex,
      (value) => {
        if (typeof value === 'number' && Number.isFinite(value)) previewIndex.value = value
      }
    )

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
        if (!openIsControlled.value) previewVisible.value = true
        emit('update:currentIndex', index)
        emit('update:open', true)
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
      const srcs = getImageGroupLightboxItems(images.value)
      const rawIndex = indexIsControlled.value ? (props.currentIndex ?? 0) : previewIndex.value
      const currentIndex = clampImageGroupPreviewIndex(rawIndex, srcs.length)
      const open = openIsControlled.value ? Boolean(props.open) : previewVisible.value
      const groupName = resolveImageGroupName({
        ariaLabel: attrs['aria-label'],
        ariaLabelledby: attrs['aria-labelledby'],
        localeLabel: labels.groupAriaLabel
      })

      const preview = props.preview
        ? h(ImagePreview, {
            open: open && srcs.length > 0,
            images: srcs,
            currentIndex,
            'onUpdate:open': (val: boolean) => {
              if (!openIsControlled.value) previewVisible.value = val
              emit('update:open', val)
              if (!val) emit('preview-open-change', false)
            },
            'onUpdate:currentIndex': (val: number) => {
              if (!indexIsControlled.value) previewIndex.value = val
              emit('update:currentIndex', val)
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
