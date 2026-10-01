import { computed, defineComponent, h, ref, watch, type PropType } from 'vue'
import {
  basicLabel,
  clampGalleryIndex,
  classNames,
  coerceClassValue,
  formatGalleryCount,
  type GalleryItem
} from '@expcat/tigercat-core'
import { Image } from './Image'
import { ImagePreview } from './ImagePreview'
import { useTigerConfig } from './tiger-config'

export interface VueGalleryProps {
  items: GalleryItem[]
  currentIndex?: number
  defaultCurrentIndex?: number
  className?: string
}

export const Gallery = defineComponent({
  name: 'TigerGallery',
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<GalleryItem[]>, required: true },
    currentIndex: { type: Number, default: undefined },
    defaultCurrentIndex: { type: Number, default: 0 },
    className: { type: String, default: undefined }
  },
  emits: ['update:currentIndex', 'update:open'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const internalIndex = ref(props.defaultCurrentIndex ?? 0)
    const open = ref(false)
    const controlled = computed(() => props.currentIndex !== undefined)

    watch(
      () => props.currentIndex,
      (value) => {
        if (typeof value === 'number' && Number.isFinite(value)) internalIndex.value = value
      }
    )

    const select = (index: number) => {
      if (!controlled.value) internalIndex.value = index
      emit('update:currentIndex', index)
    }

    return () => {
      const items = props.items ?? []
      const index = clampGalleryIndex(
        controlled.value ? (props.currentIndex ?? 0) : internalIndex.value,
        items.length
      )
      const current = items[index]
      const count = formatGalleryCount(
        basicLabel(config.value.locale?.locale, 'gallery', 'count'),
        items.length ? index + 1 : 0,
        items.length
      )
      const openLabel = basicLabel(config.value.locale?.locale, 'gallery', 'open')
      const listLabel = basicLabel(config.value.locale?.locale, 'gallery', 'list')

      return h(
        'div',
        {
          ...attrs,
          class: classNames('flex flex-col gap-2', props.className, coerceClassValue(attrs.class)),
          'data-gallery': ''
        },
        [
          current
            ? h(
                'button',
                {
                  type: 'button',
                  class: 'inline-flex w-fit border-0 bg-transparent p-0',
                  'aria-label': openLabel,
                  onClick: () => {
                    open.value = true
                    emit('update:open', true)
                  }
                },
                [
                  h(Image, {
                    src: current.src,
                    alt: current.alt,
                    preview: false,
                    width: 240,
                    height: 160
                  })
                ]
              )
            : null,
          h('p', { 'data-gallery-count': '' }, count),
          h(
            'ul',
            { 'aria-label': listLabel, class: 'm-0 flex list-none flex-wrap gap-2 p-0' },
            items.map((item, itemIndex) =>
              h('li', { key: `${item.src}-${itemIndex}` }, [
                h(
                  'button',
                  {
                    type: 'button',
                    class: classNames(
                      'border-2 bg-transparent p-0 focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)]',
                      itemIndex === index ? 'border-[var(--tiger-primary)]' : 'border-transparent'
                    ),
                    'aria-label':
                      item.alt ||
                      formatGalleryCount(
                        basicLabel(config.value.locale?.locale, 'gallery', 'count'),
                        itemIndex + 1,
                        items.length
                      ),
                    'aria-current': itemIndex === index ? 'true' : undefined,
                    onClick: () => select(itemIndex)
                  },
                  [
                    h(Image, {
                      src: item.src,
                      alt: item.alt,
                      preview: false,
                      width: 64,
                      height: 64
                    })
                  ]
                )
              ])
            )
          ),
          h(ImagePreview, {
            open: open.value,
            images: items.map((item) => ({ src: item.src, alt: item.alt })),
            currentIndex: index,
            'onUpdate:open': (value: boolean) => {
              open.value = value
              emit('update:open', value)
            },
            'onUpdate:currentIndex': (value: number) => select(value)
          })
        ]
      )
    }
  }
})

export default Gallery
