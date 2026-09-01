import { defineComponent, h, ref, computed, onBeforeUnmount, PropType } from 'vue'
import {
  applyResizeJump,
  applyResizeSize,
  classNames,
  coerceClassValue,
  createDocumentDragSession,
  defaultResizeHandles,
  formatResizableHandleLabel,
  getResizableHandleClasses,
  getResizableLabels,
  getResizeHandleOrientation,
  getResizeKeyboardDelta,
  isCornerResizeHandle,
  isSplitterRtl,
  mergeResizableBoxStyle,
  mergeStyleValues,
  resizableBaseClasses,
  resolveVisibleResizeHandles,
  type DocumentDragSession,
  type ResizeAxis,
  type ResizeHandlePosition
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueResizableProps {
  width?: number
  height?: number
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
  inheritAttrs: false,
  props: {
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
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
  emits: ['resize-start', 'resize', 'resize-end', 'update:width', 'update:height'],
  setup(props, { slots, emit, attrs }) {
    const config = useTigerConfig()
    const labels = computed(() => getResizableLabels(config.value.locale))
    const rtl = computed(() => {
      const attrDir = attrs.dir
      return isSplitterRtl(typeof attrDir === 'string' ? attrDir : config.value.direction)
    })
    const internalWidth = ref(props.defaultWidth)
    const internalHeight = ref(props.defaultHeight)
    const offsetX = ref(0)
    const offsetY = ref(0)
    const draggingHandle = ref<ResizeHandlePosition | null>(null)
    const rootRef = ref<HTMLElement | null>(null)
    let dragSession: DocumentDragSession | null = null
    const startMouseX = ref(0)
    const startMouseY = ref(0)
    const startWidth = ref(0)
    const startHeight = ref(0)
    const startOffsetX = ref(0)
    const startOffsetY = ref(0)

    const width = computed(() => (props.width !== undefined ? props.width : internalWidth.value))
    const height = computed(() =>
      props.height !== undefined ? props.height : internalHeight.value
    )

    const visibleHandles = computed(() => resolveVisibleResizeHandles(props.handles, props.axis))

    const containerClasses = computed(() =>
      classNames(
        resizableBaseClasses,
        'group/resizable',
        props.className,
        coerceClassValue(attrs.class)
      )
    )

    const cleanupDragSession = () => {
      dragSession?.dispose()
      dragSession = null
    }

    const measureBox = (): { width: number; height: number } => {
      const rect = rootRef.value?.getBoundingClientRect()
      return {
        width: width.value ?? rect?.width ?? 0,
        height: height.value ?? rect?.height ?? 0
      }
    }

    const commitSize = (
      next: { width: number; height: number; offsetX: number; offsetY: number },
      handle: ResizeHandlePosition,
      startW: number,
      startH: number,
      phase: 'move' | 'end' | 'keyboard'
    ) => {
      if (props.width === undefined) internalWidth.value = next.width
      if (props.height === undefined) internalHeight.value = next.height
      offsetX.value = startOffsetX.value + next.offsetX
      offsetY.value = startOffsetY.value + next.offsetY
      emit('update:width', next.width)
      emit('update:height', next.height)
      const event = {
        width: next.width,
        height: next.height,
        handle,
        deltaX: next.width - startW,
        deltaY: next.height - startH
      }
      emit('resize', event)
      if (phase !== 'move') emit('resize-end', event)
    }

    const resizeOptions = () => ({
      rtl: rtl.value,
      lockAspectRatio: props.lockAspectRatio,
      minWidth: props.minWidth,
      minHeight: props.minHeight,
      maxWidth: props.maxWidth,
      maxHeight: props.maxHeight
    })

    const onPointerDown = (handle: ResizeHandlePosition, e: PointerEvent) => {
      if (props.disabled || e.button !== 0) return
      e.preventDefault()
      cleanupDragSession()
      const box = measureBox()
      draggingHandle.value = handle
      startMouseX.value = e.clientX
      startMouseY.value = e.clientY
      startWidth.value = box.width
      startHeight.value = box.height
      startOffsetX.value = offsetX.value
      startOffsetY.value = offsetY.value
      emit('resize-start', {
        width: box.width,
        height: box.height,
        handle,
        deltaX: 0,
        deltaY: 0
      })

      dragSession = createDocumentDragSession({
        startX: e.clientX,
        startY: e.clientY,
        ownerDocument: (e.currentTarget as HTMLElement | null)?.ownerDocument,
        pointerId: e.pointerId,
        pointerTarget: e.currentTarget instanceof Element ? e.currentTarget : null,
        onMove: ({ currentX, currentY }) => {
          const next = applyResizeSize(
            handle,
            startWidth.value,
            startHeight.value,
            currentX - startMouseX.value,
            currentY - startMouseY.value,
            props.axis,
            resizeOptions()
          )
          commitSize(next, handle, startWidth.value, startHeight.value, 'move')
        },
        onEnd: ({ currentX, currentY }) => {
          const next = applyResizeSize(
            handle,
            startWidth.value,
            startHeight.value,
            currentX - startMouseX.value,
            currentY - startMouseY.value,
            props.axis,
            resizeOptions()
          )
          commitSize(next, handle, startWidth.value, startHeight.value, 'end')
          draggingHandle.value = null
          dragSession = null
        }
      })
    }

    const onKeyDown = (handle: ResizeHandlePosition, e: KeyboardEvent) => {
      if (props.disabled) return
      const box = measureBox()
      startOffsetX.value = offsetX.value
      startOffsetY.value = offsetY.value
      const jumped = applyResizeJump(
        e.key,
        handle,
        box.width,
        box.height,
        props.axis,
        resizeOptions()
      )
      if (jumped) {
        e.preventDefault()
        commitSize(jumped, handle, box.width, box.height, 'keyboard')
        return
      }
      const delta = getResizeKeyboardDelta(e.key)
      if (!delta) return
      e.preventDefault()
      const next = applyResizeSize(
        handle,
        box.width,
        box.height,
        delta.deltaX,
        delta.deltaY,
        props.axis,
        resizeOptions()
      )
      commitSize(next, handle, box.width, box.height, 'keyboard')
    }

    onBeforeUnmount(() => {
      cleanupDragSession()
    })

    return () => {
      const labelledby = attrs['aria-labelledby']
      const handleNodes = visibleHandles.value.map((pos) => {
        const corner = isCornerResizeHandle(pos)
        const usesHeight = pos === 'top' || pos === 'bottom'
        const valueNow = Math.round((usesHeight ? height.value : width.value) ?? 0)
        const handleName = formatResizableHandleLabel(labels.value.handleAriaLabel, pos)
        return h('div', {
          class: getResizableHandleClasses(pos, draggingHandle.value === pos, props.disabled),
          'data-handle': pos,
          role: corner ? undefined : 'separator',
          'aria-hidden': corner ? 'true' : undefined,
          'aria-label': corner || typeof labelledby === 'string' ? undefined : handleName,
          'aria-orientation': corner ? undefined : getResizeHandleOrientation(pos),
          'aria-valuenow': corner ? undefined : valueNow,
          'aria-valuemin': corner ? undefined : usesHeight ? props.minHeight : props.minWidth,
          'aria-valuemax': corner ? undefined : usesHeight ? props.maxHeight : props.maxWidth,
          tabindex: props.disabled || corner ? -1 : 0,
          onPointerdown: (e: PointerEvent) => onPointerDown(pos, e),
          onKeydown: (e: KeyboardEvent) => onKeyDown(pos, e)
        })
      })

      const boxStyle = mergeResizableBoxStyle(
        undefined,
        width.value,
        height.value,
        offsetX.value,
        offsetY.value
      )

      return h(
        'div',
        {
          ...attrs,
          ref: (el) => {
            rootRef.value = el instanceof HTMLElement ? el : null
          },
          class: containerClasses.value,
          style: mergeStyleValues(attrs.style, props.style, boxStyle),
          'data-resizable': ''
        },
        [...(slots.default?.() || []), ...handleNodes]
      )
    }
  }
})

export default Resizable
