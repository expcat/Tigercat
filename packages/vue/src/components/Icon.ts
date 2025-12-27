import { defineComponent, computed, h, PropType, VNode } from 'vue'
import { classNames, type IconSize } from '@tigercat/core'

const sizeClasses: Record<IconSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
}

export const Icon = defineComponent({
  name: 'TigerIcon',
  props: {
    size: {
      type: String as PropType<IconSize>,
      default: 'md',
    },
    color: {
      type: String,
      default: 'currentColor',
    },
    className: {
      type: String,
      default: '',
    },
  },
  setup(props, { slots }) {
    const iconClasses = computed(() => {
      return classNames(
        'inline-block',
        sizeClasses[props.size],
        props.className
      )
    })

    return () => {
      const defaultSlot = slots.default?.()
      
      // If slot contains SVG, wrap it with proper attributes
      if (defaultSlot && defaultSlot.length > 0) {
        const content = defaultSlot[0] as VNode
        
        // Check if the content is an SVG element
        if (typeof content === 'object' && content.type === 'svg') {
          // Get children safely
          const children = content.children || undefined
          
          // Safely get class from props
          const contentClass = content.props?.class
          const existingClass = typeof contentClass === 'string' ? contentClass : ''
          
          return h('svg', {
            class: classNames(iconClasses.value, existingClass),
            fill: content.props?.fill || 'none',
            stroke: props.color,
            'stroke-width': content.props?.['stroke-width'] || '2',
            'stroke-linecap': content.props?.['stroke-linecap'] || 'round',
            'stroke-linejoin': content.props?.['stroke-linejoin'] || 'round',
            viewBox: content.props?.viewBox || '0 0 24 24',
            xmlns: content.props?.xmlns || 'http://www.w3.org/2000/svg',
          }, children === null ? undefined : children)
        }
      }
      
      // Fallback: wrap slot content in a span
      return h(
        'span',
        {
          class: iconClasses.value,
          style: {
            color: props.color,
          },
        },
        defaultSlot
      )
    }
  },
})

export default Icon
