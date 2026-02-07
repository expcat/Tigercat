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
} from '@expcat/tigercat-core'

export const Link = defineComponent({
  name: 'TigerLink',
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
    /** Auto-set to 'noopener noreferrer' when target="_blank" */
    rel: { type: String },
    /** @default true */
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
      classNames(
        linkBaseClasses,
        getLinkVariantClasses(props.variant, undefined, { disabled: props.disabled }),
        linkSizeClasses[props.size],
        props.underline && 'hover:underline',
        props.disabled && linkDisabledClasses
      )
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
      }
    }

    return () =>
      h(
        'a',
        {
          ...attrs,
          class: [linkClasses.value, attrs.class],
          href: props.disabled ? undefined : props.href,
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
