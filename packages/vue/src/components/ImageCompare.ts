import { defineComponent, h, onBeforeUnmount, PropType, ref, watch, type VNodeChild } from 'vue'
import {
  composeComponentClasses,
  createDocumentDragSession,
  getImageCompareAfterClasses,
  getImageCompareBeforeClasses,
  getImageCompareClipStyle,
  getImageCompareHandleClasses,
  getImageCompareHandleStyle,
  getImageCompareImgClasses,
  getImageCompareKeyboardPosition,
  getImageCompareKnobClasses,
  getImageCompareLabels,
  getImageCompareLineClasses,
  getImageComparePointerClientPoint,
  getImageComparePositionFromPointer,
  getImageCompareRootClasses,
  getImageCompareRootStyle,
  isImageCompareInteractiveTarget,
  isImageCompareVertical,
  mergeStyleValues,
  resolveImageCompareAriaLabel,
  resolveImageCompareFit,
  resolveImageCompareOrientation,
  resolveImageComparePosition,
  resolveImageCompareRtl,
  resolveImageCompareStep,
  type DocumentDragSession,
  type ImageCompareOrientation,
  type ImageFit
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueImageCompareProps {
  beforeSrc?: string
  afterSrc?: string
  beforeAlt?: string
  afterAlt?: string
  fit?: ImageFit
  position?: number
  defaultPosition?: number
  orientation?: ImageCompareOrientation
  step?: number
  disabled?: boolean
  width?: number | string
  height?: number | string
  ariaLabel?: string
  className?: string
  style?: Record<string, unknown>
}

function invokeListener(handler: unknown, event: Event): void {
  if (typeof handler === 'function') {
    handler(event)
    return
  }
  if (Array.isArray(handler)) {
    for (const fn of handler) {
      if (typeof fn === 'function') fn(event)
    }
  }
}

export const ImageCompare = defineComponent({
  name: 'TigerImageCompare',
  inheritAttrs: false,
  props: {
    /**
     * Before (starting) image URL. The `before` slot takes precedence when provided.
     */
    beforeSrc: {
      type: String,
      default: undefined
    },
    /**
     * After (ending) image URL. The `after` slot takes precedence when provided.
     */
    afterSrc: {
      type: String,
      default: undefined
    },
    /**
     * Alternative text for the before image
     * @default ''
     */
    beforeAlt: {
      type: String,
      default: ''
    },
    /**
     * Alternative text for the after image
     * @default ''
     */
    afterAlt: {
      type: String,
      default: ''
    },
    /**
     * Object-fit applied to the before/after `<img>` elements
     * @default 'cover'
     */
    fit: {
      type: String as PropType<ImageFit>,
      default: 'cover'
    },
    /**
     * Handle position as a percentage of the before image that is visible
     * (controlled mode)
     */
    position: {
      type: Number,
      default: undefined
    },
    /**
     * Initial handle position (uncontrolled mode)
     * @default 50
     */
    defaultPosition: {
      type: Number,
      default: undefined
    },
    /**
     * Comparison axis
     * @default 'horizontal'
     */
    orientation: {
      type: String as PropType<ImageCompareOrientation>,
      default: 'horizontal'
    },
    /**
     * Keyboard and pointer snap increment, in percentage points
     * @default 1
     */
    step: {
      type: Number,
      default: undefined
    },
    /**
     * Whether pointer and keyboard adjustment are disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Root width (CSS value). A number is treated as pixels.
     */
    width: {
      type: [Number, String] as PropType<number | string>,
      default: undefined
    },
    /**
     * Root height (CSS value). A number is treated as pixels.
     */
    height: {
      type: [Number, String] as PropType<number | string>,
      default: undefined
    },
    /**
     * Accessible name for the comparison handle.
     * Empty values fall back to `locale.imageCompare.ariaLabel`.
     */
    ariaLabel: {
      type: String,
      default: undefined
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined
    },
    /**
     * Inline styles
     */
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  emits: {
    /**
     * Emitted when the handle position changes (for v-model:position)
     */
    'update:position': (value: number) => typeof value === 'number',
    /**
     * Emitted when the handle position changes
     */
    change: (value: number) => typeof value === 'number'
  },
  setup(props, { slots, emit, attrs }) {
    const config = useTigerConfig()
    const rootRef = ref<HTMLElement | null>(null)
    const handleRef = ref<HTMLElement | null>(null)
    const dragging = ref(false)
    const internalPosition = ref(
      resolveImageComparePosition(props.position ?? props.defaultPosition, props.step)
    )
    let dragSession: DocumentDragSession | null = null

    watch(
      () => props.position,
      (value) => {
        if (value !== undefined) {
          internalPosition.value = resolveImageComparePosition(value, props.step)
        }
      }
    )

    const currentPosition = (): number =>
      resolveImageComparePosition(
        props.position !== undefined ? props.position : internalPosition.value,
        props.step
      )

    const commit = (next: number): void => {
      const resolved = resolveImageComparePosition(next, props.step)
      if (props.position === undefined) {
        internalPosition.value = resolved
      }
      emit('update:position', resolved)
      emit('change', resolved)
    }

    const resolvedDir = (): string | undefined => {
      const attrDir = attrs.dir
      if (typeof attrDir === 'string') return attrDir
      return config.value.direction
    }

    const positionFromPoint = (clientX: number, clientY: number): number | null => {
      const root = rootRef.value
      if (!root) return null
      return getImageComparePositionFromPointer({
        clientX,
        clientY,
        rect: root.getBoundingClientRect(),
        orientation: props.orientation,
        step: props.step,
        rtl: resolveImageCompareRtl(resolvedDir())
      })
    }

    const stopDrag = (): void => {
      dragSession?.dispose()
      dragSession = null
      dragging.value = false
    }

    const startDrag = (event: PointerEvent): void => {
      if (props.disabled) return
      if (event.button !== 0) return
      if (isImageCompareInteractiveTarget(event.target, handleRef.value)) return

      event.preventDefault()
      const point = getImageComparePointerClientPoint(event)
      if (!point) return
      const next = positionFromPoint(point.clientX, point.clientY)
      if (next !== null) commit(next)
      handleRef.value?.focus()
      dragging.value = true
      dragSession?.dispose()
      dragSession = createDocumentDragSession({
        startX: point.clientX,
        startY: point.clientY,
        ownerDocument:
          event.currentTarget instanceof Node
            ? (event.currentTarget.ownerDocument ?? undefined)
            : undefined,
        pointerId: event.pointerId,
        pointerTarget: event.currentTarget instanceof Element ? event.currentTarget : null,
        onMove: ({ event: moveEvent, currentX, currentY }) => {
          if (moveEvent.cancelable) moveEvent.preventDefault()
          const moved = positionFromPoint(currentX, currentY)
          if (moved !== null) commit(moved)
        },
        onEnd: () => {
          dragSession = null
          dragging.value = false
        }
      })
    }

    onBeforeUnmount(stopDrag)

    const renderPaneContent = (
      slot: (() => VNodeChild) | undefined,
      src: string | undefined,
      alt: string
    ): VNodeChild => {
      if (slot) return slot()
      if (!src) return null
      return h('img', {
        src,
        alt,
        class: getImageCompareImgClasses(resolveImageCompareFit(props.fit)),
        draggable: false
      })
    }

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const orientation = resolveImageCompareOrientation(props.orientation)
      const step = resolveImageCompareStep(props.step)
      const position = currentPosition()
      const vertical = isImageCompareVertical(orientation)
      const dir = resolvedDir()
      const rtl = resolveImageCompareRtl(dir)
      const labels = getImageCompareLabels(config.value.locale)
      const attrAriaLabel =
        typeof attrsRecord['aria-label'] === 'string' ? attrsRecord['aria-label'] : undefined
      const explicitAriaLabel = resolveImageCompareAriaLabel(attrAriaLabel ?? props.ariaLabel)
      const {
        class: _class,
        style: _style,
        dir: _dir,
        'aria-label': _ariaLabel,
        'aria-labelledby': ariaLabelledby,
        'aria-describedby': ariaDescribedby,
        onPointerdown,
        onPointerDown,
        ...restAttrs
      } = attrsRecord
      const resolvedAriaLabel = ariaLabelledby
        ? explicitAriaLabel
        : (explicitAriaLabel ?? labels.ariaLabel)

      return h(
        'div',
        {
          ...restAttrs,
          ref: rootRef,
          dir,
          class: composeComponentClasses(
            getImageCompareRootClasses({
              orientation,
              disabled: props.disabled,
              className: props.className
            }),
            attrsRecord.class
          ),
          style: mergeStyleValues(
            getImageCompareRootStyle({
              width: props.width,
              height: props.height
            }),
            attrsRecord.style,
            props.style
          ),
          'data-image-compare': '',
          'data-image-compare-orientation': orientation,
          'data-image-compare-position': String(position),
          'data-image-compare-disabled': props.disabled ? 'true' : 'false',
          'data-image-compare-dragging': dragging.value ? 'true' : 'false',
          onPointerdown: (event: PointerEvent) => {
            invokeListener(onPointerdown ?? onPointerDown, event)
            if (event.defaultPrevented) return
            startDrag(event)
          }
        },
        [
          h(
            'div',
            {
              class: getImageCompareAfterClasses(),
              'data-image-compare-after': ''
            },
            [renderPaneContent(slots.after, props.afterSrc, props.afterAlt)]
          ),
          h(
            'div',
            {
              class: getImageCompareBeforeClasses(),
              style: getImageCompareClipStyle(position, orientation, step, rtl),
              'data-image-compare-before': ''
            },
            [renderPaneContent(slots.before, props.beforeSrc, props.beforeAlt)]
          ),
          h(
            'div',
            {
              ref: handleRef,
              class: getImageCompareHandleClasses({
                orientation,
                disabled: props.disabled
              }),
              style: getImageCompareHandleStyle(position, orientation, step, rtl),
              'data-image-compare-handle': '',
              role: 'slider',
              tabindex: props.disabled ? -1 : 0,
              'aria-label': resolvedAriaLabel,
              'aria-labelledby': ariaLabelledby,
              'aria-describedby': ariaDescribedby,
              'aria-valuemin': 0,
              'aria-valuemax': 100,
              'aria-valuenow': position,
              'aria-valuetext': `${position}%`,
              'aria-orientation': vertical ? 'vertical' : 'horizontal',
              'aria-disabled': props.disabled,
              onKeydown: (event: KeyboardEvent) => {
                if (props.disabled) return
                const next = getImageCompareKeyboardPosition(event.key, position, step, {
                  orientation,
                  rtl
                })
                if (next === null) return
                event.preventDefault()
                commit(next)
              }
            },
            [
              h('div', {
                class: getImageCompareLineClasses(orientation),
                'data-image-compare-line': '',
                'aria-hidden': 'true'
              }),
              h('div', {
                class: getImageCompareKnobClasses(),
                'data-image-compare-knob': '',
                'aria-hidden': 'true'
              })
            ]
          )
        ]
      )
    }
  }
})

export default ImageCompare
