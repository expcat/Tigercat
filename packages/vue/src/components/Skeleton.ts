import { defineComponent, computed, h, PropType } from 'vue'
import { 
  classNames, 
  getSkeletonClasses,
  getSkeletonDimensions,
  getParagraphRowWidth,
  type SkeletonVariant, 
  type SkeletonAnimation,
  type SkeletonShape,
} from '@tigercat/core'

export const Skeleton = defineComponent({
  name: 'TigerSkeleton',
  props: {
    /**
     * Skeleton variant - determines the placeholder shape
     * @default 'text'
     */
    variant: {
      type: String as PropType<SkeletonVariant>,
      default: 'text' as SkeletonVariant,
    },
    /**
     * Animation type
     * @default 'pulse'
     */
    animation: {
      type: String as PropType<SkeletonAnimation>,
      default: 'pulse' as SkeletonAnimation,
    },
    /**
     * Width of the skeleton
     * Can be a CSS value (e.g., '100px', '50%', '100%')
     */
    width: {
      type: String,
      default: undefined,
    },
    /**
     * Height of the skeleton
     * Can be a CSS value (e.g., '20px', '100px')
     */
    height: {
      type: String,
      default: undefined,
    },
    /**
     * Shape of the skeleton (for avatar variant)
     * @default 'circle'
     */
    shape: {
      type: String as PropType<SkeletonShape>,
      default: 'circle' as SkeletonShape,
    },
    /**
     * Number of skeleton items to render (for text variant)
     * @default 1
     */
    rows: {
      type: Number,
      default: 1,
    },
    /**
     * Whether to render as a paragraph with varying widths (for text variant)
     * @default false
     */
    paragraph: {
      type: Boolean,
      default: false,
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const skeletonClasses = computed(() => {
      return classNames(
        getSkeletonClasses(props.variant, props.animation, props.shape),
        props.className
      )
    })

    const dimensions = computed(() => {
      return getSkeletonDimensions(props.variant, props.width, props.height)
    })

    const skeletonStyle = computed(() => {
      const style: Record<string, string> = {}
      
      if (dimensions.value.width) {
        style.width = dimensions.value.width
      }
      if (dimensions.value.height) {
        style.height = dimensions.value.height
      }
      
      return style
    })

    return () => {
      // For text variant with multiple rows
      if (props.variant === 'text' && props.rows > 1) {
        const rows = []
        
        for (let i = 0; i < props.rows; i++) {
          const rowStyle: Record<string, string> = {
            height: dimensions.value.height,
          }
          
          // Apply paragraph widths if paragraph mode is enabled
          if (props.paragraph) {
            rowStyle.width = getParagraphRowWidth(i, props.rows)
          } else if (dimensions.value.width) {
            rowStyle.width = dimensions.value.width
          }
          
          rows.push(
            h('div', {
              key: i,
              class: classNames(
                skeletonClasses.value,
                i < props.rows - 1 && 'mb-2'
              ),
              style: rowStyle,
            })
          )
        }
        
        return h('div', { class: 'flex flex-col' }, rows)
      }
      
      // Single skeleton element
      return h('div', {
        class: skeletonClasses.value,
        style: skeletonStyle.value,
      })
    }
  },
})

export default Skeleton
