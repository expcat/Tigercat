import { defineComponent, h, ref, provide, onBeforeUnmount } from 'vue'
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
        const idx = images.value.length
        images.value.push(src)
        return idx
      },
      unregister(src: string) {
        const idx = images.value.indexOf(src)
        if (idx > -1) {
          images.value.splice(idx, 1)
        }
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
            visible: previewVisible.value,
            images: images.value,
            currentIndex: previewIndex.value,
            'onUpdate:visible': (val: boolean) => {
              previewVisible.value = val
              if (!val) emit('preview-visible-change', false)
            },
            'onUpdate:currentIndex': (val: number) => {
              previewIndex.value = val
            }
          })
        : null

      return h('div', { class: 'tiger-image-group', role: 'group' }, [children, preview])
    }
  }
})

export default ImageGroup
