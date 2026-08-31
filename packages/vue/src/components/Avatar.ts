import { defineComponent, computed, h, ref, watch, inject, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  avatarBaseClasses,
  avatarSizeClasses,
  avatarShapeClasses,
  avatarDefaultBgColor,
  avatarDefaultTextColor,
  avatarGeneratedTextColor,
  avatarImageClasses,
  generateAvatarColor,
  getInitials,
  pickAvatarImageAttrs,
  resolveAvatarName,
  resolveAvatarPaint,
  type AvatarSize,
  type AvatarShape
} from '@expcat/tigercat-core'
import { AVATAR_GROUP_INJECTION_KEY, type AvatarGroupContext } from './AvatarGroup'

export interface VueAvatarProps {
  size?: AvatarSize
  shape?: AvatarShape
  src?: string
  alt?: string
  text?: string
  bgColor?: string
  textColor?: string
  srcSet?: string
  sizes?: string
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
  referrerPolicy?: string
  decoding?: 'async' | 'auto' | 'sync'
  fetchPriority?: 'high' | 'low' | 'auto'
  className?: string
  style?: Record<string, string | number>
}

function invokeListener(handler: unknown, event: Event): void {
  if (typeof handler === 'function') {
    handler(event)
    return
  }
  if (Array.isArray(handler)) {
    for (const fn of handler) {
      if (typeof fn === 'function') fn(event)
    }
  }
}

export const Avatar = defineComponent({
  name: 'TigerAvatar',
  inheritAttrs: false,
  props: {
    size: {
      type: String as PropType<AvatarSize>,
      default: undefined
    },
    shape: {
      type: String as PropType<AvatarShape>,
      default: undefined
    },
    src: {
      type: String,
      default: undefined
    },
    alt: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: undefined
    },
    bgColor: {
      type: String,
      default: undefined
    },
    textColor: {
      type: String,
      default: undefined
    },
    srcSet: { type: String, default: undefined },
    sizes: { type: String, default: undefined },
    crossOrigin: {
      type: String as PropType<'' | 'anonymous' | 'use-credentials'>,
      default: undefined
    },
    referrerPolicy: { type: String, default: undefined },
    decoding: { type: String as PropType<'async' | 'auto' | 'sync'>, default: undefined },
    fetchPriority: { type: String as PropType<'high' | 'low' | 'auto'>, default: undefined },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['load', 'error'],
  setup(props, { slots, attrs, emit }) {
    const imageError = ref(false)
    const group = inject<AvatarGroupContext | null>(AVATAR_GROUP_INJECTION_KEY, null)

    watch(
      () => props.src,
      () => {
        imageError.value = false
      }
    )

    const hasImage = computed(() => Boolean(props.src) && !imageError.value)
    const resolvedSize = computed<AvatarSize>(() => props.size ?? group?.size ?? 'md')
    const resolvedShape = computed<AvatarShape>(() => props.shape ?? group?.shape ?? 'circle')

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const { image: imageAttrs, rest: spanAttrs } = pickAvatarImageAttrs(attrsRecord)
      const { computedLabel, isDecorative } = resolveAvatarName({
        alt: props.alt,
        text: props.text,
        ariaLabel: spanAttrs['aria-label'],
        ariaLabelledby: spanAttrs['aria-labelledby'],
        ariaHidden: spanAttrs['aria-hidden']
      })

      const autoBg = !props.bgColor && props.text ? generateAvatarColor(props.text) : undefined
      const bgPaint = resolveAvatarPaint(props.bgColor, 'bg', autoBg ?? avatarDefaultBgColor)
      const textPaint = resolveAvatarPaint(
        props.textColor,
        'text',
        autoBg ? avatarGeneratedTextColor : avatarDefaultTextColor
      )

      const avatarClasses = classNames(
        avatarBaseClasses,
        avatarSizeClasses[resolvedSize.value],
        avatarShapeClasses[resolvedShape.value],
        group?.itemClass,
        !hasImage.value && bgPaint.className,
        !hasImage.value && textPaint.className,
        props.className,
        coerceClassValue(spanAttrs.class)
      )

      const paintStyle =
        !hasImage.value && (bgPaint.style || textPaint.style)
          ? { ...bgPaint.style, ...textPaint.style }
          : undefined

      const baseSpanProps = {
        ...spanAttrs,
        class: avatarClasses,
        style: mergeStyleValues(spanAttrs.style, props.style, paintStyle)
      }

      const handleError = (event: Event) => {
        invokeListener(imageAttrs.onError ?? spanAttrs.onError, event)
        emit('error', event)
        if (!event.defaultPrevented) imageError.value = true
      }

      const handleLoad = (event: Event) => {
        invokeListener(imageAttrs.onLoad ?? spanAttrs.onLoad, event)
        emit('load', event)
      }

      if (hasImage.value) {
        return h(
          'span',
          { ...baseSpanProps, 'aria-hidden': isDecorative ? true : spanAttrs['aria-hidden'] },
          [
            h('img', {
              src: props.src,
              alt: computedLabel ?? '',
              srcset: props.srcSet ?? imageAttrs.srcSet,
              sizes: props.sizes ?? imageAttrs.sizes,
              crossorigin: props.crossOrigin ?? imageAttrs.crossOrigin,
              referrerpolicy: props.referrerPolicy ?? imageAttrs.referrerPolicy,
              decoding: props.decoding ?? imageAttrs.decoding,
              fetchpriority: props.fetchPriority ?? imageAttrs.fetchPriority,
              class: avatarImageClasses,
              onLoad: handleLoad,
              onError: handleError
            })
          ]
        )
      }

      const displayText = props.text ? getInitials(props.text) : ''

      return h(
        'span',
        {
          ...baseSpanProps,
          ...(isDecorative
            ? { 'aria-hidden': true }
            : {
                role: 'img',
                'aria-label': computedLabel,
                'aria-labelledby': spanAttrs['aria-labelledby']
              })
        },
        displayText || slots.default?.()
      )
    }
  }
})

export default Avatar
