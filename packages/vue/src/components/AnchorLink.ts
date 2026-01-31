import { defineComponent, h, computed, inject, onMounted, onBeforeUnmount } from 'vue'
import { classNames, coerceClassValue, getAnchorLinkClasses } from '@expcat/tigercat-core'
import { AnchorContextKey, type AnchorContext } from './Anchor'

export interface VueAnchorLinkProps {
  href: string
  title?: string
  target?: string
  className?: string
}

export const AnchorLink = defineComponent({
  name: 'TigerAnchorLink',
  inheritAttrs: false,
  props: {
    /**
     * Target anchor ID (with #)
     */
    href: {
      type: String,
      required: true
    },
    /**
     * Link title/text
     */
    title: {
      type: String,
      default: undefined
    },
    /**
     * Link target attribute
     */
    target: {
      type: String,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const anchorContext = inject<AnchorContext | null>(AnchorContextKey, null)

    // Register link on mount
    onMounted(() => {
      anchorContext?.registerLink(props.href)
    })

    // Unregister link on unmount
    onBeforeUnmount(() => {
      anchorContext?.unregisterLink(props.href)
    })

    // Handle click
    const handleClick = (event: Event) => {
      event.preventDefault()
      anchorContext?.handleLinkClick(props.href, event)
    }

    // Computed classes
    const linkClasses = computed(() => {
      const isActive = anchorContext?.activeLink === props.href
      return classNames(
        getAnchorLinkClasses(isActive, props.className),
        coerceClassValue(attrs.class)
      )
    })

    return () => {
      const content = slots.default?.() ?? props.title

      return h(
        'a',
        {
          ...attrs,
          href: props.href,
          target: props.target,
          class: linkClasses.value,
          'data-anchor-href': props.href,
          onClick: handleClick
        },
        content
      )
    }
  }
})

export default AnchorLink
