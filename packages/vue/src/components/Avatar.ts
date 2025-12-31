import { defineComponent, computed, h, ref, PropType } from 'vue'
import { 
  classNames, 
  avatarBaseClasses,
  avatarSizeClasses,
  avatarShapeClasses,
  avatarDefaultBgColor,
  avatarDefaultTextColor,
  avatarImageClasses,
  getInitials,
  type AvatarSize, 
  type AvatarShape,
} from '@tigercat/core'

export const Avatar = defineComponent({
  name: 'TigerAvatar',
  props: {
    /**
     * Avatar size
     * @default 'md'
     */
    size: {
      type: String as PropType<AvatarSize>,
      default: 'md' as AvatarSize,
    },
    /**
     * Avatar shape
     * @default 'circle'
     */
    shape: {
      type: String as PropType<AvatarShape>,
      default: 'circle' as AvatarShape,
    },
    /**
     * Image source URL
     */
    src: {
      type: String,
      default: undefined,
    },
    /**
     * Alternative text for image
     */
    alt: {
      type: String,
      default: '',
    },
    /**
     * Text content to display (e.g., initials)
     */
    text: {
      type: String,
      default: undefined,
    },
    /**
     * Background color for text/icon avatars
     */
    bgColor: {
      type: String,
      default: avatarDefaultBgColor,
    },
    /**
     * Text color for text/icon avatars
     */
    textColor: {
      type: String,
      default: avatarDefaultTextColor,
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: '',
    },
  },
  setup(props, { slots }) {
    const imageError = ref(false)

    const avatarClasses = computed(() => {
      const hasImage = props.src && !imageError.value
      return classNames(
        avatarBaseClasses,
        avatarSizeClasses[props.size],
        avatarShapeClasses[props.shape],
        // Apply background and text color only for text/icon avatars
        !hasImage && props.bgColor,
        !hasImage && props.textColor,
        props.className
      )
    })

    const displayText = computed(() => {
      if (props.text) {
        return getInitials(props.text)
      }
      return ''
    })

    const handleImageError = () => {
      imageError.value = true
    }

    return () => {
      // Priority: image > text > icon (slot)
      
      // If src is provided and not errored, show image
      if (props.src && !imageError.value) {
        return h(
          'span',
          {
            class: avatarClasses.value,
            role: 'img',
            'aria-label': props.alt || 'avatar',
          },
          [
            h('img', {
              src: props.src,
              alt: props.alt || 'avatar',
              class: avatarImageClasses,
              onError: handleImageError,
            }),
          ]
        )
      }
      
      // If text is provided, show text
      if (displayText.value) {
        return h(
          'span',
          {
            class: avatarClasses.value,
            role: 'img',
            'aria-label': props.alt || props.text || 'avatar',
          },
          displayText.value
        )
      }
      
      // Otherwise, show icon from slot
      return h(
        'span',
        {
          class: avatarClasses.value,
          role: 'img',
          'aria-label': props.alt || 'avatar',
        },
        slots.default ? slots.default() : undefined
      )
    }
  },
})

export default Avatar
