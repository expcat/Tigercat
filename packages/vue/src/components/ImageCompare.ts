import { defineComponent, h, onBeforeUnmount, PropType, ref, watch, type VNodeChild } from 'vue'
import {
  composeComponentClasses,
  getImageCompareAfterClasses,
  getImageCompareBeforeClasses,
  getImageCompareClipStyle,
  getImageCompareHandleClasses,
  getImageCompareHandleStyle,
  getImageCompareImgClasses,
  getImageCompareKeyboardPosition,
  getImageCompareKnobClasses,
  getImageCompareLineClasses,
  getImageComparePositionFromPointer,
  getImageCompareRootClasses,
  getImageCompareRootStyle,
  getImageComparePointerClientPoint,
  isImageCompareInteractiveTarget,
  isImageCompareVertical,
  mergeStyleValues,
  resolveImageCompareAriaLabel,
  resolveImageCompareFit,
  resolveImageCompareOrientation,
  resolveImageComparePosition,
  resolveImageCompareStep,
  type ImageCompareOrientation,
  type ImageFit
} from '@expcat/tigercat-core'

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

function callAttrHandler(handler: unknown, event: Event): void {
  if (typeof handler === 'function') {
    const listener = handler as (event: Event) => void
    listener(event)
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
     * Accessible name for the comparison handle
     * @default 'Image comparison'
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
    const rootRef = ref<HTMLElement | null>(null)
    const handleRef = ref<HTMLElement | null>(null)
    const dragging = ref(false)
    const internalPosition = ref(
      resolveImageComparePosition(props.position ?? props.defaultPosition, props.step)
    )

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

    const positionFromEvent = (event: MouseEvent | TouchEvent): number | null => {
      const root = rootRef.value
      const point = getImageComparePointerClientPoint(event)
      if (!root || !point) return null
      return getImageComparePositionFromPointer({
        clientX: point.clientX,
        clientY: point.clientY,
        rect: root.getBoundingClientRect(),
        orientation: props.orientation,
        step: props.step
      })
    }

    const handleMove = (event: MouseEvent | TouchEvent): void => {
      if (props.disabled || !dragging.value) return
      const next = positionFromEvent(event)
      if (next === null) return
      commit(next)
    }

    const handleEnd = (): void => {
      dragging.value = false
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleEnd)
    }

    const startDrag = (event: MouseEvent | TouchEvent): void => {
      if (props.disabled) return
      if ('button' in event && event.button !== 0) return
      if (isImageCompareInteractiveTarget(event.target, handleRef.value)) return

      event.preventDefault()
      const alreadyDragging = dragging.value
      dragging.value = true
      const next = positionFromEvent(event)
      if (next !== null) commit(next)
      handleRef.value?.focus()

      if (alreadyDragging) return
      document.addEventListener('mousemove', handleMove)
      document.addEventListener('mouseup', handleEnd)
      document.addEventListener('touchmove', handleMove)
      document.addEventListener('touchend', handleEnd)
    }

    onBeforeUnmount(handleEnd)

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
      const attrAriaLabel =
        typeof attrsRecord['aria-label'] === 'string' ? attrsRecord['aria-label'] : undefined
      const ariaLabel = resolveImageCompareAriaLabel(attrAriaLabel ?? props.ariaLabel)
      const {
        class: _class,
        style: _style,
        'aria-label': _ariaLabel,
        'aria-labelledby': ariaLabelledby,
        'aria-describedby': ariaDescribedby,
        onMousedown,
        onMouseDown,
        onTouchstart,
        onTouchStart,
        ...restAttrs
      } = attrsRecord

      return h(
        'div',
        {
          ...restAttrs,
          ref: rootRef,
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
              position,
              step,
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
          onMousedown: (event: MouseEvent) => {
            startDrag(event)
            callAttrHandler(onMousedown ?? onMouseDown, event)
          },
          onTouchstart: (event: TouchEvent) => {
            startDrag(event)
            callAttrHandler(onTouchstart ?? onTouchStart, event)
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
              style: getImageCompareClipStyle(position, orientation, step),
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
              style: getImageCompareHandleStyle(position, orientation, step),
              'data-image-compare-handle': '',
              role: 'slider',
              tabindex: props.disabled ? -1 : 0,
              'aria-label': ariaLabel,
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
                const next = getImageCompareKeyboardPosition(event.key, position, step)
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
