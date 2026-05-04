import { defineComponent, h, ref, provide, onBeforeUnmount } from 'vue'
import {
  getImageGroupClasses,
  registerImageGroupItem,
  unregisterImageGroupItem
} from '@expcat/tigercat-core'
import { ImagePreview } from './ImagePreview'

export interface ImageGroupContext {
  register: (src: string) => number
  unregister: (src: string) => void
  openPreview: (index: number) => void
}

export const IMAGE_GROUP_INJECTION_KEY = 'tiger-image-group'

export interface VueImageGroupProps {
  preview?: boolean
}

export const ImageGroup = defineComponent({
  name: 'TigerImageGroup',
  props: {
    preview: { type: Boolean, default: true }
  },
  emits: ['preview-visible-change'],
  setup(props, { slots, emit }) {
    const images = ref<string[]>([])
    const previewVisible = ref(false)
    const previewIndex = ref(0)

    const context: ImageGroupContext = {
      register(src: string): number {
        const result = registerImageGroupItem(images.value, src)
        images.value = result.items
        return result.index
      },
      unregister(src: string) {
        images.value = unregisterImageGroupItem(images.value, src)
      },
      openPreview(index: number) {
        if (!props.preview) return
        previewIndex.value = index
        previewVisible.value = true
        emit('preview-visible-change', true)
      }
    }

    provide(IMAGE_GROUP_INJECTION_KEY, context)

    onBeforeUnmount(() => {
      images.value = []
    })

    return () => {
      const children = slots.default?.()

      const preview = props.preview
        ? h(ImagePreview, {
            open: previewVisible.value,
            images: images.value,
            currentIndex: previewIndex.value,
            'onUpdate:open': (val: boolean) => {
              previewVisible.value = val
              if (!val) emit('preview-visible-change', false)
            },
            'onUpdate:currentIndex': (val: number) => {
              previewIndex.value = val
            }
          })
        : null

      return h('div', { class: getImageGroupClasses(), role: 'group' }, [children, preview])
    }
  }
})

export default ImageGroup
