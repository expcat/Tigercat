import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  getLinkVariantClasses,
  getSecureRel,
  linkBaseClasses,
  linkDisabledClasses,
  linkSizeClasses,
  type LinkVariant,
  type LinkSize
} from '@tigercat/core'

export interface VueLinkProps {
  variant?: LinkVariant
  size?: LinkSize
  disabled?: boolean
  href?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
  rel?: string
  underline?: boolean
  className?: string
  style?: Record<string, unknown>
}

export const Link = defineComponent({
  name: 'TigerLink',
  props: {
    /**
     * Link variant style
     * @default 'primary'
     */
    variant: {
      type: String as PropType<LinkVariant>,
      default: 'primary' as LinkVariant
    },
    /**
     * Link size
     * @default 'md'
     */
    size: {
      type: String as PropType<LinkSize>,
      default: 'md' as LinkSize
    },
    /**
     * Whether the link is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Link URL
     */
    href: {
      type: String
    },
    /**
     * Link target attribute
     */
    target: {
      type: String as PropType<'_blank' | '_self' | '_parent' | '_top'>
    },
    /**
     * Link rel attribute (auto-set for target="_blank")
     */
    rel: {
      type: String
    },
    /**
     * Show underline on hover
     * @default true
     */
    underline: {
      type: Boolean,
      default: true
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  emits: {
    /**
     * Emitted when link is clicked (if not disabled)
     */
    click: (event: MouseEvent) => event instanceof MouseEvent
  },
  setup(props, { slots, emit, attrs }) {
    const linkClasses = computed(() => {
      return classNames(
        linkBaseClasses,
        getLinkVariantClasses(props.variant, undefined, {
          disabled: props.disabled
        }),
        linkSizeClasses[props.size],
        props.underline && 'hover:underline',
        props.disabled && linkDisabledClasses,
        props.className
      )
    })

    const computedRel = computed(() => getSecureRel(props.target, props.rel))

    const handleClick = (event: MouseEvent) => {
      if (props.disabled) {
        event.preventDefault()
        event.stopPropagation()
        return
      }
      emit('click', event)
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (props.disabled && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    return () => {
      const children = slots.default ? slots.default() : []

      return h(
        'a',
        {
          ...attrs,
          class: [linkClasses.value, attrs.class],
          style: [props.style, attrs.style],
          href: props.disabled ? undefined : props.href,
          target: props.target,
          rel: computedRel.value,
          'aria-disabled': props.disabled ? 'true' : undefined,
          tabindex: props.disabled ? -1 : attrs.tabindex,
          onClick: handleClick,
          onKeydown: handleKeydown
        },
        children
      )
    }
  }
})

export default Link
