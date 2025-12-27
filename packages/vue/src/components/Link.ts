import { defineComponent, computed, h, PropType } from 'vue'
import { classNames, getLinkVariantClasses, type LinkVariant, type LinkSize } from '@tigercat/core'

const baseClasses = 'inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer'

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

const disabledClasses = 'cursor-not-allowed opacity-60 pointer-events-none'

export const Link = defineComponent({
  name: 'TigerLink',
  props: {
    variant: {
      type: String as PropType<LinkVariant>,
      default: 'primary',
    },
    size: {
      type: String as PropType<LinkSize>,
      default: 'md',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    href: {
      type: String,
      default: undefined,
    },
    target: {
      type: String as PropType<'_blank' | '_self' | '_parent' | '_top'>,
      default: undefined,
    },
    rel: {
      type: String,
      default: undefined,
    },
    underline: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['click'],
  setup(props, { slots, emit }) {
    const linkClasses = computed(() => {
      return classNames(
        baseClasses,
        getLinkVariantClasses(props.variant),
        sizeClasses[props.size],
        props.underline && 'hover:underline',
        props.disabled && disabledClasses
      )
    })

    const computedRel = computed(() => {
      // Automatically add security attributes for target="_blank"
      if (props.target === '_blank' && !props.rel) {
        return 'noopener noreferrer'
      }
      return props.rel
    })

    const handleClick = (event: MouseEvent) => {
      if (props.disabled) {
        event.preventDefault()
        return
      }
      emit('click', event)
    }

    return () => {
      const children = slots.default ? slots.default() : []

      return h(
        'a',
        {
          class: linkClasses.value,
          href: props.disabled ? undefined : props.href,
          target: props.target,
          rel: computedRel.value,
          'aria-disabled': props.disabled ? 'true' : undefined,
          onClick: handleClick,
        },
        children
      )
    }
  },
})

export default Link
