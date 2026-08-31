import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getTagVariantClasses,
  defaultTagThemeColors,
  icon24PathStrokeLinecap,
  icon24PathStrokeLinejoin,
  icon24StrokeWidth,
  icon24ViewBox,
  mergeStyleValues,
  tagBaseClasses,
  tagSizeClasses,
  tagPillClasses,
  tagCloseButtonBaseClasses,
  tagCloseIconPath,
  omitUnsupportedColorProp,
  getStatusLabels,
  mergeTigerLocale,
  type TagVariant,
  type TagSize,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueTagProps {
  locale?: Partial<TigerLocale>
  variant?: TagVariant
  size?: TagSize
  closable?: boolean
  closeAriaLabel?: string
  closeTabIndex?: number
  visible?: boolean
  pill?: boolean
  className?: string
  style?: Record<string, string | number>
}

const CloseIcon = () =>
  h(
    'svg',
    {
      class: 'h-3 w-3',
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: icon24ViewBox,
      stroke: 'currentColor',
      'stroke-width': String(icon24StrokeWidth),
      'aria-hidden': 'true',
      focusable: 'false'
    },
    [
      h('path', {
        'stroke-linecap': icon24PathStrokeLinecap,
        'stroke-linejoin': icon24PathStrokeLinejoin,
        d: tagCloseIconPath
      })
    ]
  )

export const Tag = defineComponent({
  name: 'TigerTag',
  inheritAttrs: false,
  props: {
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    /**
     * Tag variant style
     * @default 'default'
     */
    variant: {
      type: String as PropType<TagVariant>,
      default: 'default'
    },
    /**
     * Tag size
     * @default 'md'
     */
    size: {
      type: String as PropType<TagSize>,
      default: 'md'
    },
    /**
     * Whether the tag can be closed
     * @default false
     */
    closable: {
      type: Boolean,
      default: false
    },

    /**
     * Accessible label for the close button (when `closable` is true).
     * Defaults to ConfigProvider locale `status.tagCloseAriaLabel`.
     */
    closeAriaLabel: {
      type: String,
      default: undefined
    },
    closeTabIndex: {
      type: Number,
      default: undefined
    },

    /**
     * When `false`, the tag is not rendered. Closing never hides internally.
     */
    visible: {
      type: Boolean,
      default: undefined
    },

    /**
     * Fully rounded pill shape
     * @default false
     */
    pill: {
      type: Boolean,
      default: false
    },

    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined
    },

    /**
     * Custom styles
     */
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['close'],
  setup(props, { slots, emit, attrs }) {
    const config = useTigerConfig()
    const labels = computed(() =>
      getStatusLabels(mergeTigerLocale(config.value.locale, props.locale))
    )

    const tagClasses = computed(() =>
      classNames(
        tagBaseClasses,
        getTagVariantClasses(props.variant),
        tagSizeClasses[props.size],
        props.pill && tagPillClasses,
        props.className
      )
    )

    const closeButtonClasses = computed(() => {
      const scheme = defaultTagThemeColors[props.variant]
      return classNames(tagCloseButtonBaseClasses, scheme.closeBgHover, scheme.text)
    })

    const handleClose = (event: MouseEvent) => {
      event.stopPropagation()
      emit('close', event)
    }

    return () => {
      if (props.visible === false) {
        return null
      }

      const attrsRecord = omitUnsupportedColorProp('Tag', {
        ...(attrs as Record<string, unknown>)
      })
      const attrsClass = attrsRecord.class
      const attrsStyle = attrsRecord.style

      return h(
        'span',
        {
          ...attrsRecord,
          class: classNames(tagClasses.value, coerceClassValue(attrsClass)),
          style: mergeStyleValues(attrsStyle, props.style)
        },
        [
          slots.default ? h('span', {}, slots.default()) : null,
          props.closable
            ? h(
                'button',
                {
                  class: closeButtonClasses.value,
                  onClick: handleClose,
                  'aria-label': props.closeAriaLabel ?? labels.value.tagCloseAriaLabel,
                  tabindex: props.closeTabIndex,
                  type: 'button'
                },
                CloseIcon()
              )
            : null
        ]
      )
    }
  }
})

export default Tag
