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
  createDocumentDragSession,
  getResizeKeyboardDelta,
  getResizeHandleOrientation,
  type DocumentDragSession,
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
    let dragSession: DocumentDragSession | null = null

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

    const cleanupDragSession = () => {
      dragSession?.dispose()
      dragSession = null
    }

    const onMouseDown = (handle: ResizeHandlePosition, e: MouseEvent) => {
      if (props.disabled) return
      e.preventDefault()
      cleanupDragSession()
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

      dragSession = createDocumentDragSession({
        startX: e.clientX,
        startY: e.clientY,
        ownerDocument: (e.currentTarget as HTMLElement | null)?.ownerDocument,
        onMove: ({ currentX, currentY }) => {
          applyResize(currentX, currentY, (event) => emit('resize', event))
        },
        onEnd: ({ currentX, currentY }) => {
          applyResize(currentX, currentY, (event) => emit('resize-end', event))
          draggingHandle.value = null
          dragSession = null
        }
      })
    }

    const applyResize = (
      currentX: number,
      currentY: number,
      notify: (event: {
        width: number
        height: number
        handle: ResizeHandlePosition
        deltaX: number
        deltaY: number
      }) => void
    ) => {
      const handle = draggingHandle.value
      if (!handle) return
      const mouseDeltaX = currentX - startMouseX.value
      const mouseDeltaY = currentY - startMouseY.value
      const { deltaWidth, deltaHeight } = calculateResizeDelta(
        handle,
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
      notify({
        width: clamped.width,
        height: clamped.height,
        handle,
        deltaX: clamped.width - startWidth.value,
        deltaY: clamped.height - startHeight.value
      })
    }

    const onKeyDown = (handle: ResizeHandlePosition, e: KeyboardEvent) => {
      if (props.disabled) return
      const delta = getResizeKeyboardDelta(e.key)
      if (!delta) return
      e.preventDefault()
      const startW = width.value ?? 0
      const startH = height.value ?? 0
      const { deltaWidth, deltaHeight } = calculateResizeDelta(
        handle,
        delta.deltaX,
        delta.deltaY,
        props.axis
      )
      let newW = startW + deltaWidth
      let newH = startH + deltaHeight
      if (props.lockAspectRatio) {
        const ar = applyAspectRatio(newW, newH, startW, startH)
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
      const evt = {
        width: clamped.width,
        height: clamped.height,
        handle,
        deltaX: clamped.width - startW,
        deltaY: clamped.height - startH
      }
      emit('resize', evt)
      emit('resize-end', evt)
    }

    onBeforeUnmount(() => {
      cleanupDragSession()
    })

    return () => {
      const handleNodes = props.handles.map((pos) => {
        const usesHeight = pos === 'top' || pos === 'bottom'
        const valueNow = Math.round((usesHeight ? height.value : width.value) ?? 0)
        return h('div', {
          class: getResizableHandleClasses(pos, draggingHandle.value === pos, props.disabled),
          'data-handle': pos,
          role: 'separator',
          'aria-label': `Resize ${pos}`,
          'aria-orientation': getResizeHandleOrientation(pos),
          'aria-valuenow': valueNow,
          'aria-valuemin': usesHeight ? props.minHeight : props.minWidth,
          'aria-valuemax': usesHeight ? props.maxHeight : props.maxWidth,
          tabindex: props.disabled ? -1 : 0,
          onMousedown: (e: MouseEvent) => onMouseDown(pos, e),
          onKeydown: (e: KeyboardEvent) => onKeyDown(pos, e)
        })
      })

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
