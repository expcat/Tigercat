import { defineComponent, h, ref, computed, onMounted, onBeforeUnmount, PropType, watch } from 'vue'
import {
  classNames,
  coerceClassValue,
  getSplitterContainerClasses,
  getSplitterGutterClasses,
  getSplitterGutterHandleClasses,
  getPaneStyle,
  resizePanes,
  type SplitDirection
} from '@expcat/tigercat-core'

export interface VueSplitterProps {
  direction?: SplitDirection
  sizes?: number[]
  min?: number
  max?: number
  gutterSize?: number
  disabled?: boolean
  className?: string
  style?: Record<string, string | number>
}

export const Splitter = defineComponent({
  name: 'TigerSplitter',
  props: {
    direction: {
      type: String as PropType<SplitDirection>,
      default: 'horizontal' as SplitDirection
    },
    sizes: {
      type: Array as PropType<number[]>,
      default: undefined
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: undefined
    },
    gutterSize: {
      type: Number,
      default: 4
    },
    disabled: {
      type: Boolean,
      default: false
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['update:sizes', 'resize-start', 'resize', 'resize-end'],
  setup(props, { slots, emit, attrs }) {
    const containerRef = ref<HTMLElement | null>(null)
    const paneSizes = ref<number[]>([])
    const draggingIndex = ref<number>(-1)
    const startPos = ref(0)
    const startSizes = ref<number[]>([])

    // Sync controlled sizes
    watch(
      () => props.sizes,
      (newSizes) => {
        if (newSizes) paneSizes.value = [...newSizes]
      },
      { immediate: true }
    )

    const initSizes = () => {
      if (props.sizes && props.sizes.length > 0) {
        paneSizes.value = [...props.sizes]
        return
      }
      const el = containerRef.value
      if (!el) return
      const slotChildren = slots.default?.() || []
      const paneCount = slotChildren.length
      if (paneCount === 0) return
      const totalGutter = (paneCount - 1) * props.gutterSize
      const total =
        props.direction === 'horizontal'
          ? el.clientWidth - totalGutter
          : el.clientHeight - totalGutter
      const eachSize = total / paneCount
      paneSizes.value = Array.from({ length: paneCount }, () => eachSize)
    }

    onMounted(initSizes)

    const containerClasses = computed(() =>
      classNames(
        getSplitterContainerClasses(props.direction, props.className),
        coerceClassValue(attrs.class)
      )
    )

    // Build mins/maxes arrays
    const getMins = () => paneSizes.value.map(() => props.min)
    const getMaxes = () => paneSizes.value.map(() => props.max)

    const onMouseDown = (index: number, e: MouseEvent) => {
      if (props.disabled) return
      e.preventDefault()
      draggingIndex.value = index
      startPos.value = props.direction === 'horizontal' ? e.clientX : e.clientY
      startSizes.value = [...paneSizes.value]
      emit('resize-start', { index, sizes: [...paneSizes.value] })
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    const onMouseMove = (e: MouseEvent) => {
      if (draggingIndex.value < 0) return
      const currentPos = props.direction === 'horizontal' ? e.clientX : e.clientY
      const delta = currentPos - startPos.value
      const newSizes = resizePanes(
        startSizes.value,
        draggingIndex.value,
        delta,
        getMins(),
        getMaxes()
      )
      if (newSizes) {
        paneSizes.value = newSizes
        emit('update:sizes', newSizes)
        emit('resize', { index: draggingIndex.value, sizes: newSizes })
      }
    }

    const onMouseUp = () => {
      if (draggingIndex.value >= 0) {
        emit('resize-end', {
          index: draggingIndex.value,
          sizes: [...paneSizes.value]
        })
      }
      draggingIndex.value = -1
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    })

    return () => {
      const children = slots.default?.() || []
      const nodes: ReturnType<typeof h>[] = []

      children.forEach((child, i) => {
        // Pane wrapper
        const size = paneSizes.value[i]
        const paneStyle = size != null ? getPaneStyle(size, props.direction) : undefined
        nodes.push(
          h(
            'div',
            {
              class: 'tiger-splitter-pane relative overflow-auto',
              style: paneStyle,
              'data-pane-index': i
            },
            [child]
          )
        )

        // Gutter between panes
        if (i < children.length - 1) {
          const isDragging = draggingIndex.value === i
          nodes.push(
            h(
              'div',
              {
                class: getSplitterGutterClasses(props.direction, isDragging, props.disabled),
                role: 'separator',
                'aria-orientation': props.direction === 'horizontal' ? 'vertical' : 'horizontal',
                tabindex: props.disabled ? -1 : 0,
                'data-gutter-index': i,
                onMousedown: (e: MouseEvent) => onMouseDown(i, e),
                onKeydown: (e: KeyboardEvent) => {
                  if (props.disabled) return
                  const step = 10
                  let delta = 0
                  if (
                    (props.direction === 'horizontal' && e.key === 'ArrowLeft') ||
                    (props.direction === 'vertical' && e.key === 'ArrowUp')
                  ) {
                    delta = -step
                  } else if (
                    (props.direction === 'horizontal' && e.key === 'ArrowRight') ||
                    (props.direction === 'vertical' && e.key === 'ArrowDown')
                  ) {
                    delta = step
                  }
                  if (delta !== 0) {
                    e.preventDefault()
                    const newSizes = resizePanes(paneSizes.value, i, delta, getMins(), getMaxes())
                    if (newSizes) {
                      paneSizes.value = newSizes
                      emit('update:sizes', newSizes)
                      emit('resize', { index: i, sizes: newSizes })
                    }
                  }
                }
              },
              [h('div', { class: getSplitterGutterHandleClasses(props.direction) })]
            )
          )
        }
      })

      return h(
        'div',
        {
          ref: containerRef,
          class: containerClasses.value,
          style: props.style,
          'data-direction': props.direction
        },
        nodes
      )
    }
  }
})

export default Splitter
