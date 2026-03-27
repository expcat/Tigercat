import { defineComponent, h, ref, computed, onBeforeUnmount, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  resizableBaseClasses,
  getResizableHandleClasses,
  calculateResizeDelta,
  clampDimensions,
  applyAspectRatio,
  defaultResizeHandles,
  type ResizeHandlePosition,
  type ResizeAxis
} from '@expcat/tigercat-core'

export interface VueResizableProps {
  defaultWidth?: number
  defaultHeight?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  handles?: ResizeHandlePosition[]
  axis?: ResizeAxis
  disabled?: boolean
  lockAspectRatio?: boolean
  className?: string
  style?: Record<string, string | number>
}

export const Resizable = defineComponent({
  name: 'TigerResizable',
  props: {
    defaultWidth: { type: Number, default: undefined },
    defaultHeight: { type: Number, default: undefined },
    minWidth: { type: Number, default: 0 },
    minHeight: { type: Number, default: 0 },
    maxWidth: { type: Number, default: undefined },
    maxHeight: { type: Number, default: undefined },
    handles: {
      type: Array as PropType<ResizeHandlePosition[]>,
      default: () => [...defaultResizeHandles]
    },
    axis: {
      type: String as PropType<ResizeAxis>,
      default: 'both' as ResizeAxis
    },
    disabled: { type: Boolean, default: false },
    lockAspectRatio: { type: Boolean, default: false },
    className: { type: String, default: undefined },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['resize-start', 'resize', 'resize-end'],
  setup(props, { slots, emit, attrs }) {
    const width = ref(props.defaultWidth)
    const height = ref(props.defaultHeight)
    const draggingHandle = ref<ResizeHandlePosition | null>(null)
    const startMouseX = ref(0)
    const startMouseY = ref(0)
    const startWidth = ref(0)
    const startHeight = ref(0)

    const containerClasses = computed(() =>
      classNames(
        resizableBaseClasses,
        'group/resizable',
        props.className,
        coerceClassValue(attrs.class)
      )
    )

    const containerStyle = computed(() => {
      const s: Record<string, string> = {}
      if (width.value != null) s.width = `${width.value}px`
      if (height.value != null) s.height = `${height.value}px`
      return s
    })

    const onMouseDown = (handle: ResizeHandlePosition, e: MouseEvent) => {
      if (props.disabled) return
      e.preventDefault()
      draggingHandle.value = handle
      startMouseX.value = e.clientX
      startMouseY.value = e.clientY
      startWidth.value = width.value ?? 0
      startHeight.value = height.value ?? 0
      emit('resize-start', {
        width: startWidth.value,
        height: startHeight.value,
        handle,
        deltaX: 0,
        deltaY: 0
      })
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!draggingHandle.value) return
      const mouseDeltaX = e.clientX - startMouseX.value
      const mouseDeltaY = e.clientY - startMouseY.value
      const { deltaWidth, deltaHeight } = calculateResizeDelta(
        draggingHandle.value,
        mouseDeltaX,
        mouseDeltaY,
        props.axis
      )
      let newW = startWidth.value + deltaWidth
      let newH = startHeight.value + deltaHeight

      if (props.lockAspectRatio) {
        const ar = applyAspectRatio(newW, newH, startWidth.value, startHeight.value)
        newW = ar.width
        newH = ar.height
      }

      const clamped = clampDimensions(
        newW,
        newH,
        props.minWidth,
        props.minHeight,
        props.maxWidth,
        props.maxHeight
      )
      width.value = clamped.width
      height.value = clamped.height
      emit('resize', {
        width: clamped.width,
        height: clamped.height,
        handle: draggingHandle.value,
        deltaX: clamped.width - startWidth.value,
        deltaY: clamped.height - startHeight.value
      })
    }

    const onMouseUp = () => {
      if (draggingHandle.value) {
        emit('resize-end', {
          width: width.value ?? 0,
          height: height.value ?? 0,
          handle: draggingHandle.value,
          deltaX: (width.value ?? 0) - startWidth.value,
          deltaY: (height.value ?? 0) - startHeight.value
        })
      }
      draggingHandle.value = null
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    })

    return () => {
      const handleNodes = props.handles.map((pos) =>
        h('div', {
          class: getResizableHandleClasses(pos, draggingHandle.value === pos, props.disabled),
          'data-handle': pos,
          onMousedown: (e: MouseEvent) => onMouseDown(pos, e)
        })
      )

      return h(
        'div',
        {
          class: containerClasses.value,
          style: { ...containerStyle.value, ...(props.style as Record<string, string>) },
          'data-resizable': ''
        },
        [...(slots.default?.() || []), ...handleNodes]
      )
    }
  }
})

export default Resizable
