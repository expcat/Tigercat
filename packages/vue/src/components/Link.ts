import { defineComponent, computed, h, PropType } from 'vue'
import {
  getSecureRel,
  resolveLinkClasses,
  type LinkVariant,
  type LinkSize
} from '@expcat/tigercat-core'

export interface VueLinkProps {
  variant?: LinkVariant
  size?: LinkSize
  disabled?: boolean
  href?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
  rel?: string
  underline?: boolean
}

function callListener(listener: unknown, event: Event): void {
  if (typeof listener === 'function') {
    listener(event)
    return
  }
  if (Array.isArray(listener)) {
    for (const item of listener) callListener(item, event)
  }
}

export const Link = defineComponent({
  name: 'TigerLink',
  inheritAttrs: false,
  props: {
    /** @default 'primary' */
    variant: {
      type: String as PropType<LinkVariant>,
      default: 'primary' as LinkVariant
    },
    /** @default 'md' */
    size: {
      type: String as PropType<LinkSize>,
      default: 'md' as LinkSize
    },
    /** @default false */
    disabled: {
      type: Boolean,
      default: false
    },
    href: { type: String },
    target: {
      type: String as PropType<'_blank' | '_self' | '_parent' | '_top'>
    },
    /** `_blank` always merges noopener noreferrer into rel */
    rel: { type: String },
    /** Underline at rest. @default true */
    underline: {
      type: Boolean,
      default: true
    }
  },
  emits: {
    click: (event: MouseEvent) => event instanceof MouseEvent
  },
  setup(props, { slots, emit, attrs }) {
    const linkClasses = computed(() =>
      resolveLinkClasses({
        variant: props.variant,
        size: props.size,
        underline: props.underline,
        disabled: props.disabled
      })
    )

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
        return
      }
      callListener(attrs.onKeydown, event)
    }

    return () =>
      h(
        'a',
        {
          ...attrs,
          class: [linkClasses.value, attrs.class],
          href: props.href,
          target: props.target,
          rel: computedRel.value,
          'aria-disabled': props.disabled ? 'true' : undefined,
          tabindex: props.disabled ? -1 : attrs.tabindex,
          onClick: handleClick,
          onKeydown: handleKeydown
        },
        slots.default?.()
      )
  }
})

export default Link
