import { defineComponent, h, PropType, ref } from 'vue'
import {
  composeComponentClasses,
  getMarqueeCloneAttributes,
  getMarqueeContentClasses,
  getMarqueeContentStyle,
  getMarqueeRootClasses,
  getMarqueeTrackClasses,
  getMarqueeTrackStyle,
  injectMarqueeStyles,
  isMarqueeFocusInside,
  isMarqueePaused,
  mergeStyleValues,
  resolveMarqueeDirection,
  resolveMarqueePauseOnHover,
  resolveMarqueeRegion,
  resolveMarqueeRepeat,
  type MarqueeDirection,
  type MarqueeGap
} from '@expcat/tigercat-core'

export interface VueMarqueeProps {
  direction?: MarqueeDirection
  duration?: number
  pauseOnHover?: boolean
  gap?: MarqueeGap
  repeat?: number
  ariaLabel?: string
  className?: string
  style?: Record<string, unknown>
}

export const Marquee = defineComponent({
  name: 'TigerMarquee',
  inheritAttrs: false,
  props: {
    /**
     * Scroll direction. `left`/`right` are logical (inline-start/end).
     * Vertical height is the first copy unless the root height is set.
     * @default 'left'
     */
    direction: {
      type: String as PropType<MarqueeDirection>,
      default: 'left'
    },
    /**
     * Time for one full loop, in milliseconds
     * @default 20000
     */
    duration: {
      type: Number,
      default: undefined
    },
    /**
     * Pause looping while hovered or while focus is inside the region
     * @default true
     */
    pauseOnHover: {
      type: Boolean,
      default: true
    },
    /**
     * Gap between items and between duplicated copies.
     * A number is pixels; a string is a CSS length.
     * @default 16
     */
    gap: {
      type: [Number, String] as PropType<MarqueeGap>,
      default: undefined
    },
    /**
     * How many copies of the content to render for a seamless loop.
     * Omitted or non-finite → 2. Values below 2 (including 0) show one
     * static copy. Extra copies do not grow a vertical viewport.
     * @default 2
     */
    repeat: {
      type: Number,
      default: undefined
    },
    /**
     * Accessible name for the region. Omitted or blank: not a landmark.
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
  setup(props, { slots, attrs }) {
    injectMarqueeStyles()

    const hovered = ref(false)
    const focused = ref(false)

    function callAttrHandler(handler: unknown, event: Event): void {
      if (typeof handler === 'function') {
        const listener = handler as (event: Event) => void
        listener(event)
      }
    }

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const direction = resolveMarqueeDirection(props.direction)
      const pauseOnHover = resolveMarqueePauseOnHover(props.pauseOnHover)
      const copies = resolveMarqueeRepeat(props.repeat)
      const paused = isMarqueePaused({
        pauseOnHover,
        hovered: hovered.value,
        focused: focused.value
      })
      const attrAriaLabel =
        typeof attrsRecord['aria-label'] === 'string' ? attrsRecord['aria-label'] : undefined
      const attrLabelledBy =
        typeof attrsRecord['aria-labelledby'] === 'string'
          ? attrsRecord['aria-labelledby']
          : undefined
      const region = resolveMarqueeRegion({
        ariaLabel: attrAriaLabel ?? props.ariaLabel,
        labelledBy: attrLabelledBy
      })

      const contentCopies = Array.from({ length: copies }, (_, index) => {
        const clone = index > 0
        return h(
          'div',
          {
            class: getMarqueeContentClasses({ direction, clone }),
            style: getMarqueeContentStyle({ clone, index }),
            'data-marquee-content': '',
            ...(clone ? getMarqueeCloneAttributes() : {})
          },
          slots.default?.()
        )
      })

      return h(
        'div',
        {
          ...attrs,
          class: composeComponentClasses(
            getMarqueeRootClasses({
              direction,
              pauseOnHover,
              repeat: copies,
              className: props.className
            }),
            attrsRecord.class
          ),
          style: mergeStyleValues(attrsRecord.style, props.style),
          role: region.role,
          'aria-label': region.ariaLabel,
          'data-marquee': '',
          'data-marquee-direction': direction,
          'data-marquee-paused': paused ? 'true' : 'false',
          'data-marquee-pause-on-hover': pauseOnHover ? 'true' : 'false',
          onMouseenter: (event: MouseEvent) => {
            if (pauseOnHover) hovered.value = true
            callAttrHandler(attrsRecord.onMouseenter, event)
          },
          onMouseleave: (event: MouseEvent) => {
            if (pauseOnHover) hovered.value = false
            callAttrHandler(attrsRecord.onMouseleave, event)
          },
          onFocusin: (event: FocusEvent) => {
            if (pauseOnHover) focused.value = true
            callAttrHandler(attrsRecord.onFocusin, event)
          },
          onFocusout: (event: FocusEvent) => {
            if (pauseOnHover && !isMarqueeFocusInside(event.currentTarget, event.relatedTarget)) {
              focused.value = false
            }
            callAttrHandler(attrsRecord.onFocusout, event)
          }
        },
        [
          h(
            'div',
            {
              class: getMarqueeTrackClasses(direction),
              style: getMarqueeTrackStyle({
                duration: props.duration,
                gap: props.gap,
                repeat: copies
              }),
              'data-marquee-track': ''
            },
            contentCopies
          )
        ]
      )
    }
  }
})

export default Marquee
